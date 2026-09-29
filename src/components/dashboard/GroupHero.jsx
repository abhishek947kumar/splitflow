import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Plus,
  ArrowRightLeft,
  PieChart,
  Users,
  Settings,
} from 'lucide-react';

export function GroupHero() {
  const {
    activeGroup,
    currentUser,
    currentUserStats,
    groupBalances,
    activeGroupAllExpenses,
    setExpenseModalOpen,
    setEditingExpense,
    setActiveTab,
    setSettleModalOpen,
    setSettlePrefill,
    simplifiedDebts,
    setGroupSettingsModalOpen,
  } = useApp();

  if (!activeGroup) return null;

  const baseCurr = activeGroup.currency || 'USD';
  const netBalance = currentUserStats?.netBalance || 0;
  const isOwed = netBalance > 0.005;
  const owes = netBalance < -0.005;
  const isSettled = !isOwed && !owes;

  // Find if user has a recommended debt to settle right now
  const userOwedTx = simplifiedDebts.find((tx) => tx.fromMemberId === currentUser.id);

  const handleQuickSettle = () => {
    if (userOwedTx) {
      setSettlePrefill({
        fromMemberId: userOwedTx.fromMemberId,
        toMemberId: userOwedTx.toMemberId,
        amount: userOwedTx.amount,
      });
      setSettleModalOpen(true);
    } else {
      setActiveTab('settlements');
    }
  };

  return (
    <div className="glass-card group-hero animate-fade">
      {/* Left: Personalized Net Balance Hero */}
      <div className="hero-balance-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>{activeGroup.emoji}</span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeGroup.name}</h1>
          <span className="badge-pill badge-neutral" style={{ fontSize: '0.72rem' }}>
            Base: {baseCurr}
          </span>
        </div>

        {activeGroup.description && (
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            {activeGroup.description}
          </p>
        )}

        <div style={{ marginTop: '10px' }}>
          {isOwed && (
            <div className="balance-status-badge badge-positive">
              <TrendingUp size={16} />
              <span>You are owed overall</span>
            </div>
          )}
          {owes && (
            <div className="balance-status-badge badge-negative">
              <TrendingDown size={16} />
              <span>You owe money overall</span>
            </div>
          )}
          {isSettled && (
            <div className="balance-status-badge badge-neutral">
              <CheckCircle size={16} color="var(--positive)" />
              <span>You are all settled up!</span>
            </div>
          )}

          <div
            id="hero-user-balance"
            className={`hero-balance-figure ${isOwed ? 'positive' : owes ? 'negative' : 'settled'}`}
            style={{ marginTop: '6px' }}
          >
            {isOwed && '+'}
            {formatCurrency(netBalance, baseCurr)}
          </div>

          <div className="hero-subtext">
            {isOwed && (
              <span>Group members owe you in this group. You can send a reminder or record settlements below.</span>
            )}
            {owes && userOwedTx && (
              <span>
                Recommended:{' '}
                <strong>
                  Pay {formatCurrency(userOwedTx.amount, baseCurr)} to {userOwedTx.toMemberName}
                </strong>{' '}
                to clear your balance.
              </span>
            )}
            {owes && !userOwedTx && (
              <span>You have outstanding balances to settle in this group.</span>
            )}
            {isSettled && (
              <span>No debts or pending claims for {currentUser.name.split(' ')[0]} in this group.</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Group Metrics Grid */}
      <div className="hero-metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Group Spent</span>
          <span id="metric-group-total" className="metric-value">
            {formatCurrency(groupBalances.groupTotalSpent, baseCurr)}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Across {activeGroupAllExpenses.length} shared expenses
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Your Share (Consumed)</span>
          <span id="metric-user-share" className="metric-value" style={{ color: 'var(--text-secondary)' }}>
            {formatCurrency(currentUserStats?.totalShare || 0, baseCurr)}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Your portion of group bills
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">You Paid Upfront</span>
          <span id="metric-user-paid" className="metric-value" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(currentUserStats?.totalPaid || 0, baseCurr)}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Bills you paid at checkout
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Active Members</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <span className="metric-value">{activeGroup.members?.length || 0}</span>
            <div style={{ display: 'flex', marginLeft: '-6px' }}>
              {activeGroup.members?.slice(0, 3).map((m) => (
                <span
                  key={m.id}
                  style={{
                    marginLeft: '-4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: m.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    border: '2px solid var(--bg-card-solid)',
                  }}
                  title={m.name}
                >
                  {m.avatar}
                </span>
              ))}
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            All included in calculations
          </span>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="hero-actions-bar">
        <div className="hero-actions-left">
          <button
            id="hero-add-expense-btn"
            className="btn-primary"
            onClick={() => {
              setEditingExpense(null);
              setExpenseModalOpen(true);
            }}
          >
            <Plus size={16} /> Log Expense
          </button>

          <button
            id="hero-settle-up-btn"
            className="btn-settle"
            onClick={handleQuickSettle}
          >
            <ArrowRightLeft size={16} /> Settle Up
          </button>

          <button
            id="hero-analytics-tab-btn"
            className="btn-secondary"
            onClick={() => setActiveTab('analytics')}
          >
            <PieChart size={16} /> Spending Analytics
          </button>
        </div>

        <div className="hero-actions-right">
          <button
            id="hero-group-settings-btn"
            className="btn-ghost"
            style={{ fontSize: '0.84rem' }}
            onClick={() => setGroupSettingsModalOpen(true)}
          >
            <Settings size={15} /> Group Settings
          </button>
        </div>
      </div>
    </div>
  );
}
