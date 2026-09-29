import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import { ArrowRight, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export function SettlementHistory() {
  const {
    activeGroup,
    activeGroupSettlements,
    deleteSettlement,
  } = useApp();

  const baseCurr = activeGroup?.currency || 'USD';
  const members = activeGroup?.members || [];

  const handleDelete = (settlementId) => {
    if (window.confirm('Delete this settlement record? Group balances will revert.')) {
      deleteSettlement(settlementId);
    }
  };

  return (
    <div className="settlement-history-view animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Settlement Audit Log</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Chronological ledger of confirmed payments and cleared debts in <strong>{activeGroup?.name}</strong>.
          </p>
        </div>
        <span className="badge-pill badge-neutral">
          {activeGroupSettlements.length} {activeGroupSettlements.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      {activeGroupSettlements.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeGroupSettlements.map((st) => {
            const fromMember = members.find((m) => m.id === st.fromMemberId);
            const toMember = members.find((m) => m.id === st.toMemberId);

            return (
              <div
                key={st.id}
                id={`settlement-log-${st.id}`}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  gap: '16px',
                }}
              >
                {/* Left: Transfer description */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--positive-bg)',
                      color: 'var(--positive)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={20} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Avatar name={fromMember?.name || 'Debtor'} emoji={fromMember?.avatar} color={fromMember?.color} size={22} />
                        {fromMember?.name || 'Someone'}
                      </span>
                      <ArrowRight size={14} color="var(--positive)" />
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Avatar name={toMember?.name || 'Creditor'} emoji={toMember?.avatar} color={toMember?.color} size={22} />
                        {toMember?.name || 'Someone'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {st.date}
                      </span>
                      <span>•</span>
                      <span className="badge-pill badge-neutral" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                        {st.paymentMethod || 'Transfer'}
                      </span>
                      {st.note && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{st.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount and Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--positive)',
                    }}
                    className="tabular-nums"
                  >
                    {formatCurrency(st.amount, st.currency || baseCurr)}
                  </div>

                  <button
                    id={`delete-settlement-${st.id}`}
                    className="btn-ghost"
                    style={{ padding: '6px', color: 'var(--text-muted)' }}
                    onClick={() => handleDelete(st.id)}
                    title="Delete settlement record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle2 size={36} color="var(--text-muted)" />
          <h4 style={{ fontSize: '1.05rem' }}>No settlements recorded yet</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            When members pay off their balances, their payment history and digital receipts will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
