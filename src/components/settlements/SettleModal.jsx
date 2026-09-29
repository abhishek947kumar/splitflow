import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import { QRCodeSVG } from '../common/QRCodeSVG';
import {
  X,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Banknote,
  Send,
  ExternalLink,
  QrCode,
  Smartphone,
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'Venmo', name: 'Venmo', icon: '📱' },
  { id: 'PayPal', name: 'PayPal', icon: '💳' },
  { id: 'Cash', name: 'Cash', icon: '💵' },
  { id: 'Zelle', name: 'Zelle', icon: '⚡' },
  { id: 'Bank Transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'Revolut', name: 'Revolut', icon: '💳' },
  { id: 'Apple Cash', name: 'Apple Cash', icon: '🍎' },
  { id: 'UPI', name: 'UPI', icon: '🇮🇳' },
];

export function SettleModal() {
  const {
    activeGroup,
    currentUser,
    settleModalOpen,
    setSettleModalOpen,
    settlePrefill,
    setSettlePrefill,
    recordSettlement,
  } = useApp();

  const baseCurr = activeGroup?.currency || 'USD';
  const members = activeGroup?.members || [];

  const [fromMemberId, setFromMemberId] = useState('');
  const [toMemberId, setToMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Venmo');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  // Handle prefill or defaults when opening
  useEffect(() => {
    if (!settleModalOpen) return;

    if (settlePrefill) {
      setFromMemberId(settlePrefill.fromMemberId || '');
      setToMemberId(settlePrefill.toMemberId || '');
      setAmount(String(settlePrefill.amount || ''));
    } else {
      // Default from current user to another member if user owes
      setFromMemberId(currentUser.id);
      const other = members.find((m) => m.id !== currentUser.id);
      setToMemberId(other ? other.id : '');
      setAmount('');
    }

    setPaymentMethod('Venmo');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
  }, [settleModalOpen, settlePrefill, currentUser.id, members]);

  const handleClose = () => {
    setSettleModalOpen(false);
    setSettlePrefill(null);
  };

  const fromMember = members.find((m) => m.id === fromMemberId);
  const toMember = members.find((m) => m.id === toMemberId);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromMemberId || !toMemberId) {
      alert('Please select both payer and recipient.');
      return;
    }
    if (fromMemberId === toMemberId) {
      alert('Payer and recipient cannot be the same person.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid settlement amount.');
      return;
    }

    recordSettlement({
      groupId: activeGroup.id,
      fromMemberId,
      toMemberId,
      amount: Number(amount),
      currency: baseCurr,
      date,
      paymentMethod,
      note: note.trim() || `Settled via ${paymentMethod}`,
    });

    handleClose();
  };

  if (!settleModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Record Settlement</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mark a debt as paid in <strong>{activeGroup?.name}</strong>
            </p>
          </div>
          <button
            id="close-settle-modal-btn"
            className="btn-ghost"
            style={{ padding: '6px' }}
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Visual Payer -> Recipient Header Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Payer Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Avatar name={fromMember?.name || 'Payer'} emoji={fromMember?.avatar} color={fromMember?.color} size={42} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{fromMember?.name?.split(' ')[0] || 'Payer'}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payer</span>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Pays
                </span>
                <ArrowRight size={22} color="var(--positive)" />
              </div>

              {/* Recipient Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Avatar name={toMember?.name || 'Recipient'} emoji={toMember?.avatar} color={toMember?.color} size={42} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{toMember?.name?.split(' ')[0] || 'Recipient'}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recipient</span>
              </div>
            </div>

            {/* From & To Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Who Paid? (Debtor)
                </label>
                <select
                  id="settle-from-select"
                  value={fromMemberId}
                  onChange={(e) => setFromMemberId(e.target.value)}
                  required
                >
                  <option value="">Select payer</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === currentUser.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Who Received? (Creditor)
                </label>
                <select
                  id="settle-to-select"
                  value={toMemberId}
                  onChange={(e) => setToMemberId(e.target.value)}
                  required
                >
                  <option value="">Select recipient</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === currentUser.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Settlement Amount ({baseCurr}) *
              </label>
              <input
                id="settle-amount-input"
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '1.3rem', fontWeight: 700 }}
                autoFocus
                required
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                You can record full or partial payments. Balances will recalculate immediately.
              </span>
            </div>

            {/* Payment Method Chips */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Payment Method
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      className={`btn-ghost ${isSelected ? 'active' : ''}`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        border: `1px solid ${isSelected ? 'var(--positive)' : 'var(--border-subtle)'}`,
                        background: isSelected ? 'var(--positive-bg)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? 'var(--positive)' : 'var(--text-primary)',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      onClick={() => setPaymentMethod(pm.id)}
                    >
                      <span>{pm.icon}</span>
                      <span>{pm.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic QR Code & App Deep Links Section */}
            {['Venmo', 'PayPal', 'UPI', 'Revolut'].includes(paymentMethod) && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                      Instant {paymentMethod} QR & Deep Link
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: '0.76rem', color: 'var(--primary)', padding: '2px 8px' }}
                    onClick={() => setShowQRCode(!showQRCode)}
                  >
                    {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                  </button>
                </div>

                {showQRCode && (
                  <div
                    className="animate-fade"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 0',
                    }}
                  >
                    <QRCodeSVG
                      value={
                        paymentMethod === 'UPI'
                          ? `upi://pay?pa=${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}@okaxis&pn=${encodeURIComponent(toMember?.name || 'Friend')}&am=${amount || 0}&cu=INR&tn=${encodeURIComponent(note || 'SplitFlow settlement')}`
                          : paymentMethod === 'Venmo'
                          ? `https://venmo.com/?txn=pay&recipients=${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}&amount=${amount || 0}&note=${encodeURIComponent(note || 'SplitFlow settlement')}`
                          : paymentMethod === 'PayPal'
                          ? `https://paypal.me/${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}/${amount || 0}`
                          : `https://revolut.me/${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}`
                      }
                      size={150}
                    />

                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Scan with your phone camera or {paymentMethod} app to pay {toMember?.name || 'friend'} {formatCurrency(amount || 0, baseCurr)}
                    </span>

                    {/* Direct Launch Button */}
                    <a
                      href={
                        paymentMethod === 'UPI'
                          ? `upi://pay?pa=${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}@okaxis&pn=${encodeURIComponent(toMember?.name || 'Friend')}&am=${amount || 0}&cu=INR&tn=${encodeURIComponent(note || 'SplitFlow settlement')}`
                          : paymentMethod === 'Venmo'
                          ? `https://venmo.com/?txn=pay&recipients=${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}&amount=${amount || 0}&note=${encodeURIComponent(note || 'SplitFlow settlement')}`
                          : paymentMethod === 'PayPal'
                          ? `https://paypal.me/${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}/${amount || 0}`
                          : `https://revolut.me/${(toMember?.name || 'friend').toLowerCase().replace(/\s+/g, '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Smartphone size={14} color="var(--primary)" />
                      <span>Open {paymentMethod} Directly</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Date & Note */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date
                </label>
                <input
                  id="settle-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Optional Note
                </label>
                <input
                  id="settle-note-input"
                  type="text"
                  placeholder="e.g. Cleared via Venmo with dinner memo"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              id="confirm-settlement-btn"
              type="submit"
              className="btn-settle"
            >
              <CheckCircle2 size={16} /> Confirm Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
