import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import { VisualDebtGraph } from './VisualDebtGraph';
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  Layers,
  Network,
} from 'lucide-react';

export function SettlementView() {
  const {
    activeGroup,
    currentUser,
    simplifiedDebts,
    directPairwiseDebts,
    groupBalances,
    settlementViewMode,
    setSettlementViewMode,
    setSettleModalOpen,
    setSettlePrefill,
  } = useApp();

  const baseCurr = activeGroup?.currency || 'USD';
  const members = activeGroup?.members || [];
  const memberStats = groupBalances.memberStats || {};

  const activeDebts = settlementViewMode === 'simplified' ? simplifiedDebts : directPairwiseDebts;

  const handleSettleCard = (debt) => {
    setSettlePrefill({
      fromMemberId: debt.fromMemberId,
      toMemberId: debt.toMemberId,
      amount: debt.amount,
    });
    setSettleModalOpen(true);
  };

  return (
    <div className="settlement-dashboard animate-fade">
      {/* Top Controls Bar */}
      <div className="settlement-mode-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--positive-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--positive)',
            }}
          >
            <ArrowRightLeft size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Who Owes Whom</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {settlementViewMode === 'simplified'
                ? 'Optimal minimal transactions (Min-Cash-Flow graph simplification)'
                : 'Direct bilateral balances between every pair of members'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            id="settle-mode-simplified-btn"
            className="btn-ghost"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              background: settlementViewMode === 'simplified' ? 'var(--primary)' : 'transparent',
              color: settlementViewMode === 'simplified' ? '#fff' : 'var(--text-secondary)',
            }}
            onClick={() => setSettlementViewMode('simplified')}
          >
            <Sparkles size={13} /> Simplified Debts ({simplifiedDebts.length})
          </button>
          <button
            id="settle-mode-pairwise-btn"
            className="btn-ghost"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              background: settlementViewMode === 'pairwise' ? 'var(--primary)' : 'transparent',
              color: settlementViewMode === 'pairwise' ? '#fff' : 'var(--text-secondary)',
            }}
            onClick={() => setSettlementViewMode('pairwise')}
          >
            <Layers size={13} /> Detailed Pairwise ({directPairwiseDebts.length})
          </button>
          <button
            id="settle-mode-graph-btn"
            className="btn-ghost"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              background: settlementViewMode === 'graph' ? 'var(--primary)' : 'transparent',
              color: settlementViewMode === 'graph' ? '#fff' : 'var(--text-secondary)',
            }}
            onClick={() => setSettlementViewMode('graph')}
          >
            <Network size={13} /> Visual Graph
          </button>
        </div>
      </div>

      {/* Mode View: Network Graph OR Cards Grid */}
      {settlementViewMode === 'graph' ? (
        <VisualDebtGraph
          members={members}
          debts={simplifiedDebts}
          memberStats={memberStats}
          baseCurrency={baseCurr}
          onSelectDebt={handleSettleCard}
          currentUserId={currentUser.id}
        />
      ) : activeDebts.length > 0 ? (
        <div className="settlement-cards-grid">
          {activeDebts.map((debt) => {
            const isFromUser = debt.fromMemberId === currentUser.id;
            const isToUser = debt.toMemberId === currentUser.id;
            const involvesUser = isFromUser || isToUser;

            return (
              <div
                key={debt.id}
                id={`settlement-card-${debt.id}`}
                className={`settlement-card ${involvesUser ? 'involves-user' : ''}`}
              >
                {/* User Relationship Banner */}
                {involvesUser && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '14px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isFromUser ? 'var(--negative)' : 'var(--positive)',
                    }}
                  >
                    {isFromUser ? 'You owe this' : 'You are owed this'}
                  </div>
                )}

                {/* Transfer Diagram: Debtor -> Creditor */}
                <div className="settlement-flow-row" style={{ marginTop: involvesUser ? '10px' : '0' }}>
                  {/* Debtor */}
                  <div className="member-flow-node">
                    <Avatar
                      name={debt.fromMemberName}
                      color={debt.fromMemberColor}
                      size={44}
                    />
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, marginTop: '4px' }}>
                      {debt.fromMemberName}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--negative)', fontWeight: 600 }}>
                      Owes
                    </span>
                  </div>

                  {/* Flow Arrow & Amount */}
                  <div className="flow-arrow-container">
                    <div className="settle-amount-badge">
                      {formatCurrency(debt.amount, baseCurr)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '4px', margin: '4px 0' }}>
                      <div className="flow-line" />
                      <ArrowRight size={18} className="flow-arrow-head" />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {settlementViewMode === 'simplified' ? 'simplified path' : 'direct balance'}
                    </span>
                  </div>

                  {/* Creditor */}
                  <div className="member-flow-node">
                    <Avatar
                      name={debt.toMemberName}
                      color={debt.toMemberColor}
                      size={44}
                    />
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, marginTop: '4px' }}>
                      {debt.toMemberName}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--positive)', fontWeight: 600 }}>
                      Receives
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    id={`settle-btn-${debt.fromMemberId}-${debt.toMemberId}`}
                    className="btn-settle"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleSettleCard(debt)}
                  >
                    <span>Record Settlement ({formatCurrency(debt.amount, baseCurr)})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* All Settled Up State */
        <div
          className="glass-card"
          style={{
            padding: '50px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--positive-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--positive)',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Everyone is all square! 🎉</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.9rem' }}>
            There are no outstanding debts in <strong>{activeGroup.name}</strong>. All shared expenses have been fully balanced.
          </p>
        </div>
      )}

      {/* Group Net Balances Ledger Table */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Group Balance Ledger</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Transparent breakdown of what each person paid upfront versus their consumption share.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Info size={14} />
            <span>Net = (Paid - Share) + (Settled)</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px' }}>Member</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Paid Upfront</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Share (Consumed)</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Settlements Effect</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Net Balance</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const stats = memberStats[m.id] || { totalPaid: 0, totalShare: 0, settledPaid: 0, settledReceived: 0, netBalance: 0 };
                const net = stats.netBalance;
                const isPositive = net > 0.005;
                const isNegative = net < -0.005;
                const isMe = m.id === currentUser.id;

                const settlementNet = stats.settledPaid - stats.settledReceived;

                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isMe ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={m.name} emoji={m.avatar} color={m.color} size={30} />
                      <div>
                        <div style={{ fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {m.name} {isMe ? '(You)' : ''}
                        </div>
                        {m.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.email}</div>}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }} className="tabular-nums">
                      {formatCurrency(stats.totalPaid, baseCurr)}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-secondary)' }} className="tabular-nums">
                      {formatCurrency(stats.totalShare, baseCurr)}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }} className="tabular-nums">
                      {settlementNet !== 0 ? (settlementNet > 0 ? `+${formatCurrency(settlementNet, baseCurr)}` : formatCurrency(settlementNet, baseCurr)) : '—'}
                    </td>

                    <td
                      style={{
                        padding: '12px 14px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        color: isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-muted)',
                      }}
                      className="tabular-nums"
                    >
                      {isPositive ? `+${formatCurrency(net, baseCurr)}` : formatCurrency(net, baseCurr)}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {isPositive ? (
                        <span className="badge-pill badge-positive" style={{ fontSize: '0.72rem' }}>
                          <TrendingUp size={12} /> Gets Back
                        </span>
                      ) : isNegative ? (
                        <span className="badge-pill badge-negative" style={{ fontSize: '0.72rem' }}>
                          <TrendingDown size={12} /> Owes
                        </span>
                      ) : (
                        <span className="badge-pill badge-neutral" style={{ fontSize: '0.72rem' }}>
                          <CheckCircle2 size={12} color="var(--positive)" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
