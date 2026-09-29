// Settlement Engine: Group Balance Calculations, Pairwise Debts, and Min-Cash-Flow Debt Simplification
import { convertCurrency } from './currencyService.js';

/**
 * Calculates net balances, total paid, and total spent for all members in a group.
 * All figures are normalized to the group's base currency.
 */
export function calculateGroupBalances(group, expenses = [], settlements = [], rates = {}) {
  const baseCurrency = group.currency || 'USD';
  const members = group.members || [];

  // Initialize summary map for every member
  const memberStats = {};
  members.forEach((m) => {
    memberStats[m.id] = {
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      color: m.color,
      totalPaid: 0,       // how much they paid upfront for expenses
      totalShare: 0,      // how much they consumed / owed from expenses
      settledPaid: 0,     // how much they sent in settlements
      settledReceived: 0, // how much they received in settlements
      netBalance: 0,      // positive = owed money, negative = owes money
    };
  });

  let groupTotalSpent = 0;

  // Process Expenses
  expenses.forEach((expense) => {
    // Convert expense amount to group base currency
    const expenseBaseAmount = convertCurrency(
      expense.amount,
      expense.currency || baseCurrency,
      baseCurrency,
      rates
    );

    groupTotalSpent += expenseBaseAmount;

    // Handle Payer(s)
    if (expense.multiplePayers && Array.isArray(expense.payers)) {
      expense.payers.forEach((p) => {
        if (memberStats[p.memberId]) {
          const payerBase = convertCurrency(
            p.amount,
            expense.currency || baseCurrency,
            baseCurrency,
            rates
          );
          memberStats[p.memberId].totalPaid += payerBase;
        }
      });
    } else {
      // Single payer
      const payerId = expense.paidBy;
      if (memberStats[payerId]) {
        memberStats[payerId].totalPaid += expenseBaseAmount;
      }
    }

    // Handle Participants Split Shares
    const splits = expense.splits || [];
    splits.forEach((s) => {
      if (memberStats[s.memberId]) {
        const shareBase = convertCurrency(
          s.amount,
          expense.currency || baseCurrency,
          baseCurrency,
          rates
        );
        memberStats[s.memberId].totalShare += shareBase;
      }
    });
  });

  // Process Settlements
  settlements.forEach((st) => {
    const stBaseAmount = convertCurrency(
      st.amount,
      st.currency || baseCurrency,
      baseCurrency,
      rates
    );

    if (memberStats[st.fromMemberId]) {
      memberStats[st.fromMemberId].settledPaid += stBaseAmount;
    }
    if (memberStats[st.toMemberId]) {
      memberStats[st.toMemberId].settledReceived += stBaseAmount;
    }
  });

  // Calculate Final Net Balance for each member:
  // net = (totalPaid - totalShare) + (settledPaid - settledReceived)
  // Explanation:
  // - If Alice paid $100 for dinner and her share was $25, she has credit +$75.
  // - When Bob settles $25 to Alice, Bob's settledPaid is +$25 (improving Bob's net),
  //   and Alice's settledReceived is +$25 (reducing Alice's credit by $25).
  Object.values(memberStats).forEach((stats) => {
    stats.netBalance =
      stats.totalPaid - stats.totalShare + stats.settledPaid - stats.settledReceived;
    stats.netBalance = Math.round(stats.netBalance * 100) / 100;
    stats.totalPaid = Math.round(stats.totalPaid * 100) / 100;
    stats.totalShare = Math.round(stats.totalShare * 100) / 100;
    stats.settledPaid = Math.round(stats.settledPaid * 100) / 100;
    stats.settledReceived = Math.round(stats.settledReceived * 100) / 100;
  });

  return {
    memberStats,
    groupTotalSpent: Math.round(groupTotalSpent * 100) / 100,
    baseCurrency,
  };
}

/**
 * Min-Cash-Flow Algorithm: Simplifies debts so the minimum number of transactions
 * are required to clear all balances.
 */
export function simplifyDebts(memberStats = {}, groupCurrency = 'USD') {
  // Extract members with non-zero net balances
  // Creditors: netBalance > 0.01 (are owed money)
  // Debtors: netBalance < -0.01 (owe money)
  const creditors = [];
  const debtors = [];

  Object.values(memberStats).forEach((member) => {
    const bal = Math.round(member.netBalance * 100) / 100;
    if (bal > 0.01) {
      creditors.push({ ...member, balance: bal });
    } else if (bal < -0.01) {
      debtors.push({ ...member, balance: Math.abs(bal) });
    }
  });

  // Sort descending by magnitude to prioritize settling largest debts first
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  const simplifiedTransactions = [];
  let i = 0; // index for debtors
  let j = 0; // index for creditors

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.balance, creditor.balance);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0.01) {
      simplifiedTransactions.push({
        id: `sim-${debtor.id}-${creditor.id}-${i}-${j}`,
        fromMemberId: debtor.id,
        fromMemberName: debtor.name,
        fromMemberColor: debtor.color,
        toMemberId: creditor.id,
        toMemberName: creditor.name,
        toMemberColor: creditor.color,
        amount: roundedAmount,
        currency: groupCurrency,
      });
    }

    debtor.balance = Math.round((debtor.balance - roundedAmount) * 100) / 100;
    creditor.balance = Math.round((creditor.balance - roundedAmount) * 100) / 100;

    if (debtor.balance < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return simplifiedTransactions;
}

/**
 * Detailed Pairwise Debt: Shows direct member-to-member balances
 * (without multi-party simplification) for full transparency.
 */
export function calculateDirectPairwiseDebts(group, expenses = [], settlements = [], rates = {}) {
  const baseCurrency = group.currency || 'USD';
  const members = group.members || [];
  const memberMap = members.reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {});

  // Matrix: pairwise[fromId][toId] = amount from owes to
  const pairwise = {};
  members.forEach((m1) => {
    pairwise[m1.id] = {};
    members.forEach((m2) => {
      pairwise[m1.id][m2.id] = 0;
    });
  });

  // Track each expense's individual splits
  expenses.forEach((expense) => {
    const splits = expense.splits || [];
    const expenseBaseAmount = convertCurrency(
      expense.amount,
      expense.currency || baseCurrency,
      baseCurrency,
      rates
    );

    if (expense.multiplePayers && Array.isArray(expense.payers)) {
      // Proportional multi-payer distribution
      const totalPaid = expense.payers.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 1;
      expense.payers.forEach((payer) => {
        const payerBase = convertCurrency(
          payer.amount,
          expense.currency || baseCurrency,
          baseCurrency,
          rates
        );
        const payerFraction = payerBase / expenseBaseAmount;

        splits.forEach((split) => {
          if (split.memberId !== payer.memberId) {
            const splitBase = convertCurrency(
              split.amount,
              expense.currency || baseCurrency,
              baseCurrency,
              rates
            );
            const owedToPayer = splitBase * payerFraction;
            if (pairwise[split.memberId] && pairwise[split.memberId][payer.memberId] !== undefined) {
              pairwise[split.memberId][payer.memberId] += owedToPayer;
            }
          }
        });
      });
    } else {
      const payerId = expense.paidBy;
      splits.forEach((split) => {
        if (split.memberId !== payerId) {
          const splitBase = convertCurrency(
            split.amount,
            expense.currency || baseCurrency,
            baseCurrency,
            rates
          );
          if (pairwise[split.memberId] && pairwise[split.memberId][payerId] !== undefined) {
            pairwise[split.memberId][payerId] += splitBase;
          }
        }
      });
    }
  });

  // Deduct settlements from pairwise matrix
  settlements.forEach((st) => {
    const stBase = convertCurrency(
      st.amount,
      st.currency || baseCurrency,
      baseCurrency,
      rates
    );
    if (pairwise[st.fromMemberId] && pairwise[st.fromMemberId][st.toMemberId] !== undefined) {
      pairwise[st.fromMemberId][st.toMemberId] -= stBase;
    }
  });

  // Net out bilateral pairs: if A owes B $30 and B owes A $10 => net A owes B $20
  const netPairwise = [];
  const processed = new Set();

  members.forEach((m1) => {
    members.forEach((m2) => {
      if (m1.id === m2.id) return;
      const key = [m1.id, m2.id].sort().join(':');
      if (processed.has(key)) return;
      processed.add(key);

      const m1OwesM2 = pairwise[m1.id]?.[m2.id] || 0;
      const m2OwesM1 = pairwise[m2.id]?.[m1.id] || 0;

      const diff = m1OwesM2 - m2OwesM1;
      const rounded = Math.round(Math.abs(diff) * 100) / 100;

      if (rounded > 0.01) {
        if (diff > 0) {
          netPairwise.push({
            id: `pair-${m1.id}-${m2.id}`,
            fromMemberId: m1.id,
            fromMemberName: memberMap[m1.id]?.name || 'Unknown',
            fromMemberColor: memberMap[m1.id]?.color,
            toMemberId: m2.id,
            toMemberName: memberMap[m2.id]?.name || 'Unknown',
            toMemberColor: memberMap[m2.id]?.color,
            amount: rounded,
            currency: baseCurrency,
          });
        } else {
          netPairwise.push({
            id: `pair-${m2.id}-${m1.id}`,
            fromMemberId: m2.id,
            fromMemberName: memberMap[m2.id]?.name || 'Unknown',
            fromMemberColor: memberMap[m2.id]?.color,
            toMemberId: m1.id,
            toMemberName: memberMap[m1.id]?.name || 'Unknown',
            toMemberColor: memberMap[m1.id]?.color,
            amount: rounded,
            currency: baseCurrency,
          });
        }
      }
    });
  });

  return netPairwise;
}
