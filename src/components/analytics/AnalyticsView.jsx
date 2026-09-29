import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, CATEGORY_MAP } from '../../constants/categories';
import { formatCurrency } from '../../constants/currencies';
import { convertCurrency } from '../../services/currencyService';
import { Avatar } from '../common/Avatar';
import { PrintableStatementModal } from './PrintableStatementModal';
import {
  PieChart,
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  TrendingUp,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';

export function AnalyticsView() {
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const {
    activeGroup,
    activeGroupAllExpenses,
    groupBalances,
    currencyRates,
    currentUser,
    setExportModalOpen,
  } = useApp();

  const baseCurr = activeGroup?.currency || 'USD';
  const members = activeGroup?.members || [];
  const memberStats = groupBalances.memberStats || {};
  const totalSpent = groupBalances.groupTotalSpent || 0;

  // Calculate Category Breakdown
  const categoryTotals = {};
  CATEGORIES.forEach((cat) => {
    categoryTotals[cat.id] = 0;
  });

  activeGroupAllExpenses.forEach((exp) => {
    const baseAmt = convertCurrency(
      exp.amount,
      exp.currency || baseCurr,
      baseCurr,
      currencyRates
    );
    const catId = exp.category || 'general';
    categoryTotals[catId] = (categoryTotals[catId] || 0) + baseAmt;
  });

  const categoryData = CATEGORIES.map((cat) => {
    const amt = Math.round((categoryTotals[cat.id] || 0) * 100) / 100;
    const percentage = totalSpent > 0 ? Math.round((amt / totalSpent) * 1000) / 10 : 0;
    return {
      ...cat,
      amount: amt,
      percentage,
    };
  })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // SVG Donut Chart Math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!activeGroupAllExpenses.length) {
      alert('No expenses to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Title', 'Category', 'Original Amount', 'Currency', 'Converted (Group Base)', 'Paid By', 'Note'];
    const rows = activeGroupAllExpenses.map((exp) => {
      const payer = members.find((m) => m.id === exp.paidBy)?.name || exp.paidBy;
      const convertedAmt = convertCurrency(exp.amount, exp.currency || baseCurr, baseCurr, currencyRates);
      return [
        exp.id,
        exp.date,
        `"${(exp.title || '').replace(/"/g, '""')}"`,
        exp.category,
        exp.amount,
        exp.currency || baseCurr,
        convertedAmt,
        `"${payer}"`,
        `"${(exp.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeGroup.name.replace(/\s+/g, '_')}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON Function
  const handleExportJSON = () => {
    const payload = {
      group: activeGroup,
      totalSpent,
      baseCurrency: baseCurr,
      expenses: activeGroupAllExpenses,
      memberLedger: memberStats,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `${activeGroup.name.replace(/\s+/g, '_')}_summary.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-view animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Analytics Header & Export Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Spending Breakdown & Analytics</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Visual distribution of expenses across categories and members.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="export-statement-btn"
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '7px 14px' }}
            onClick={() => setStatementModalOpen(true)}
          >
            <Printer size={15} /> Printable PDF Statement
          </button>
          <button
            id="export-csv-btn"
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '7px 12px' }}
            onClick={handleExportCSV}
          >
            <FileSpreadsheet size={15} color="var(--positive)" /> Export CSV
          </button>
          <button
            id="export-json-btn"
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '7px 12px' }}
            onClick={handleExportJSON}
          >
            <FileJson size={15} color="var(--primary)" /> Export JSON
          </button>
        </div>
      </div>

      {/* Main Grid: Category Donut & Member Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Category Spending Donut Chart Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} color="var(--primary)" /> Spending by Category
          </h4>

          {categoryData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Donut SVG Chart */}
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background track circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="24"
                  />

                  {/* Arcs for each category */}
                  {categoryData.map((cat) => {
                    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += cat.percentage;

                    return (
                      <circle
                        key={cat.id}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="24"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transition: 'stroke-dasharray 0.5s ease',
                          cursor: 'pointer',
                        }}
                      >
                        <title>{`${cat.name}: ${formatCurrency(cat.amount, baseCurr)} (${cat.percentage}%)`}</title>
                      </circle>
                    );
                  })}
                </svg>

                {/* Donut Center Text */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Total Spent
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                    {formatCurrency(totalSpent, baseCurr)}
                  </span>
                </div>
              </div>

              {/* Category Legend List */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryData.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                          flexShrink: 0,
                        }}
                      />
                      <span>{cat.emoji}</span>
                      <span style={{ fontWeight: 500 }}>{cat.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {cat.percentage}%
                      </span>
                      <span style={{ fontWeight: 700 }} className="tabular-nums">
                        {formatCurrency(cat.amount, baseCurr)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No expense categories to show.
            </div>
          )}
        </div>

        {/* Member Spending vs Consumption Bar Chart Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="var(--primary)" /> Member Contributions vs Share
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-10px' }}>
            Green bars indicate amount paid upfront; gray bars indicate consumption share.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {members.map((m) => {
              const stats = memberStats[m.id] || { totalPaid: 0, totalShare: 0 };
              const maxVal = Math.max(
                ...members.map((mem) => {
                  const s = memberStats[mem.id] || { totalPaid: 0, totalShare: 0 };
                  return Math.max(s.totalPaid, s.totalShare);
                }),
                1
              );

              const paidPct = Math.min(100, Math.round((stats.totalPaid / maxVal) * 100));
              const sharePct = Math.min(100, Math.round((stats.totalShare / maxVal) * 100));

              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                      <Avatar name={m.name} emoji={m.avatar} color={m.color} size={24} />
                      <span>{m.name}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Paid: <strong>{formatCurrency(stats.totalPaid, baseCurr)}</strong> · Share: {formatCurrency(stats.totalShare, baseCurr)}
                    </div>
                  </div>

                  {/* Dual Bar Progress */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Paid Bar */}
                    <div
                      style={{
                        height: '7px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${paidPct}%`,
                          background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    {/* Share Bar */}
                    <div
                      style={{
                        height: '7px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${sharePct}%`,
                          background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Printable Financial Statement Modal */}
      <PrintableStatementModal
        isOpen={statementModalOpen}
        onClose={() => setStatementModalOpen(false)}
      />
    </div>
  );
}
