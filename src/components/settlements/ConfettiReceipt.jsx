import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import { CheckCircle2, Copy, X, Share2, Sparkles } from 'lucide-react';

export function ConfettiReceipt() {
  const {
    celebrationData,
    setCelebrationData,
    activeGroup,
    addToast,
  } = useApp();

  if (!celebrationData) return null;

  const baseCurr = celebrationData.currency || activeGroup?.currency || 'USD';
  const members = activeGroup?.members || [];
  const fromMember = members.find((m) => m.id === celebrationData.fromMemberId);
  const toMember = members.find((m) => m.id === celebrationData.toMemberId);

  const handleCopyNote = () => {
    const text = `🎉 SplitFlow Settlement:\n${fromMember?.name} paid ${toMember?.name} ${formatCurrency(celebrationData.amount, baseCurr)} via ${celebrationData.paymentMethod || 'Transfer'} in "${activeGroup?.name}" on ${celebrationData.date}.\nAll settled!`;
    navigator.clipboard?.writeText(text);
    addToast('Settlement details copied to clipboard!', 'success');
  };

  const handleClose = () => {
    setCelebrationData(null);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          textAlign: 'center',
          overflow: 'hidden',
          border: '1px solid var(--positive-border)',
        }}
      >
        {/* Confetti Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(99, 102, 241, 0.15) 100%)',
            padding: '30px 20px 20px 20px',
            position: 'relative',
          }}
        >
          <button
            id="close-celebration-btn"
            className="btn-ghost"
            style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px' }}
            onClick={handleClose}
          >
            <X size={18} />
          </button>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--positive)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              marginBottom: '12px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Settlement Recorded!
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Group balances updated instantly in real-time.
          </p>
        </div>

        {/* Digital Receipt Card */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            {/* Watermark stamp */}
            <div
              style={{
                position: 'absolute',
                right: '14px',
                bottom: '14px',
                border: '2px solid var(--positive)',
                color: 'var(--positive)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontWeight: 900,
                fontSize: '0.82rem',
                letterSpacing: '0.1em',
                transform: 'rotate(-12deg)',
                opacity: 0.85,
                pointerEvents: 'none',
              }}
            >
              SETTLED
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Amount Paid
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--positive)',
                }}
              >
                {formatCurrency(celebrationData.amount, baseCurr)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>From (Debtor):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Avatar name={fromMember?.name || 'Member'} emoji={fromMember?.avatar} color={fromMember?.color} size={22} />
                <span>{fromMember?.name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>To (Creditor):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Avatar name={toMember?.name || 'Member'} emoji={toMember?.avatar} color={toMember?.color} size={22} />
                <span>{toMember?.name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {celebrationData.paymentMethod || 'Direct Transfer'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date:</span>
              <span style={{ color: 'var(--text-primary)' }}>{celebrationData.date}</span>
            </div>

            {celebrationData.note && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong>Note:</strong> {celebrationData.note}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              id="copy-receipt-btn"
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleCopyNote}
            >
              <Copy size={15} /> Copy Receipt
            </button>
            <button
              id="done-receipt-btn"
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
