import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import { convertCurrency } from '../../services/currencyService';
import { Avatar } from '../common/Avatar';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';

export function PrintableStatementModal({ isOpen, onClose }) {
  const {
    activeGroup,
    activeGroupAllExpenses,
    activeGroupSettlements,
    groupBalances,
    simplifiedDebts,
    currencyRates,
  } = useApp();

  if (!isOpen || !activeGroup) return null;

  const baseCurr = activeGroup.currency || 'USD';
  const members = activeGroup.members || [];
  const memberStats = groupBalances.memberStats || {};
  const totalSpent = groupBalances.groupTotalSpent || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          maxHeight: '92vh',
          background: '#ffffff',
          color: '#0f172a',
          padding: '0',
          overflowY: 'auto',
        }}
      >
        {/* Screen Action Bar (hidden on print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: '#0f172a',
            color: '#fff',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#6366f1" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Financial Statement & Expense Summary
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              id="statement-print-btn"
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={handlePrint}
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              className="btn-ghost"
              style={{ padding: '6px', color: '#94a3b8' }}
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div
          id="printable-statement-sheet"
          style={{
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1.5,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {activeGroup.emoji} {activeGroup.name}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                Group Financial Statement & Balance Settlement Audit
              </div>
              {activeGroup.description && (
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                  {activeGroup.description}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#475569' }}>
              <div><strong>Statement Date:</strong> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>Base Currency:</strong> {baseCurr}</div>
              <div><strong>Members:</strong> {members.length} participants</div>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Total Group Expenditure
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {formatCurrency(totalSpent, baseCurr)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Across {activeGroupAllExpenses.length} shared expenses
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Pending Simplified Debts
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e11d48', marginTop: '4px' }}>
                {simplifiedDebts.length} Transfers
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Optimized Min-Cash-Flow resolution
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Settled Audit Records
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {activeGroupSettlements.length} Completed
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Payments already cleared
              </div>
            </div>
          </div>

          {/* Member Net Balance Summary Table */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              1. Member Net Balance Ledger
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Member</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Paid Upfront</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Consumption Share</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Net Settlements</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Final Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const stats = memberStats[m.id] || { totalPaid: 0, totalShare: 0, settledPaid: 0, settledReceived: 0, netBalance: 0 };
                  const isPositive = stats.netBalance > 0.005;
                  const isNegative = stats.netBalance < -0.005;
                  const settlementNet = stats.settledPaid - stats.settledReceived;

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(stats.totalPaid, baseCurr)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>{formatCurrency(stats.totalShare, baseCurr)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>
                        {settlementNet !== 0 ? (settlementNet > 0 ? `+${formatCurrency(settlementNet, baseCurr)}` : formatCurrency(settlementNet, baseCurr)) : '—'}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: isPositive ? '#059669' : isNegative ? '#e11d48' : '#64748b',
                        }}
                      >
                        {isPositive ? `+${formatCurrency(stats.netBalance, baseCurr)}` : formatCurrency(stats.netBalance, baseCurr)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recommended Settlement Payments */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              2. Recommended Settlement Actions (Simplified Debt Clearing)
            </h4>
            {simplifiedDebts.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {simplifiedDebts.map((tx, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#fff',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>{tx.fromMemberName}</strong> pays <strong>{tx.toMemberName}</strong>
                    </div>
                    <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                      {formatCurrency(tx.amount, baseCurr)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#059669', padding: '8px', background: '#ecfdf5', borderRadius: '6px' }}>
                ✓ Group is fully settled up! No outstanding payments required.
              </div>
            )}
          </div>

          {/* All Itemized Expenses Table */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              3. Shared Expenses Ledger ({activeGroupAllExpenses.length} Records)
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px' }}>Date</th>
                  <th style={{ padding: '6px 10px' }}>Expense</th>
                  <th style={{ padding: '6px 10px' }}>Category</th>
                  <th style={{ padding: '6px 10px' }}>Paid By</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right' }}>Original Cost</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right' }}>Group Base Cost ({baseCurr})</th>
                </tr>
              </thead>
              <tbody>
                {activeGroupAllExpenses.map((exp) => {
                  const payer = members.find((m) => m.id === exp.paidBy)?.name || exp.paidBy;
                  const convertedAmt = convertCurrency(exp.amount, exp.currency || baseCurr, baseCurr, currencyRates);
                  return (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 10px', color: '#64748b' }}>{exp.date}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>{exp.title}</td>
                      <td style={{ padding: '6px 10px', textTransform: 'capitalize', color: '#475569' }}>{exp.category}</td>
                      <td style={{ padding: '6px 10px' }}>{payer}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                        {formatCurrency(exp.amount, exp.currency || baseCurr)}
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(convertedAmt, baseCurr)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Statement Footer */}
          <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontSize: '0.74rem', color: '#94a3b8', textAlign: 'center' }}>
            Generated automatically by SplitFlow • Multi-Currency Group Expense Platform • All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}
