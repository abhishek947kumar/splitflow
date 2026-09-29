import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_MAP } from '../../constants/categories';
import { formatCurrency } from '../../constants/currencies';
import { convertCurrency } from '../../services/currencyService';
import { Avatar } from '../common/Avatar';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Globe2,
  Calendar,
  FileText,
  CreditCard,
} from 'lucide-react';

export function ExpenseItem({ expense }) {
  const {
    activeGroup,
    currentUser,
    currencyRates,
    setEditingExpense,
    setExpenseModalOpen,
    deleteExpense,
  } = useApp();

  const [expanded, setExpanded] = useState(false);

  const groupBaseCurr = activeGroup?.currency || 'USD';
  const expenseCurr = expense.currency || groupBaseCurr;
  const isMultiCurrency = expenseCurr !== groupBaseCurr;

  const category = CATEGORY_MAP[expense.category] || CATEGORY_MAP['general'];

  // Convert total to group base currency
  const convertedTotal = convertCurrency(
    expense.amount,
    expenseCurr,
    groupBaseCurr,
    currencyRates
  );

  // Find member info for payer
  const payer = activeGroup?.members?.find((m) => m.id === expense.paidBy);
  const isUserPayer = expense.paidBy === currentUser.id;

  // Find current user's share in this expense
  const userSplit = (expense.splits || []).find((s) => s.memberId === currentUser.id);
  const userShareInExpenseCurr = userSplit ? Number(userSplit.amount) || 0 : 0;
  const userShareInBase = convertCurrency(
    userShareInExpenseCurr,
    expenseCurr,
    groupBaseCurr,
    currencyRates
  );

  // Net effect for current user on this specific expense:
  // If user paid: user is owed (total - userShare)
  // If another paid: user owes userShare
  let userEffectText = 'Not involved';
  let userEffectClass = 'badge-neutral';
  let userEffectAmount = 0;

  if (isUserPayer) {
    userEffectAmount = convertedTotal - userShareInBase;
    userEffectText = `You lent ${formatCurrency(userEffectAmount, groupBaseCurr)}`;
    userEffectClass = 'badge-positive';
  } else if (userSplit) {
    userEffectAmount = userShareInBase;
    userEffectText = `You owe ${formatCurrency(userEffectAmount, groupBaseCurr)}`;
    userEffectClass = 'badge-negative';
  }

  const handleEdit = (e) => {
    e.stopPropagation();
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete expense "${expense.title}"?`)) {
      deleteExpense(expense.id);
    }
  };

  return (
    <div
      id={`expense-card-${expense.id}`}
      className="expense-item animate-fade"
      onClick={() => setExpanded(!expanded)}
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '0',
        padding: '0',
        overflow: 'hidden',
      }}
    >
      {/* Main Expense Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          gap: '16px',
        }}
      >
        {/* Left: Category Icon & Title Info */}
        <div className="expense-left">
          <div
            className="category-icon-box"
            style={{
              backgroundColor: category.bg,
              color: category.color,
            }}
          >
            <span>{category.emoji}</span>
          </div>

          <div className="expense-info">
            <div className="expense-title">
              <span>{expense.title}</span>
              {isMultiCurrency && (
                <span
                  className="badge-pill badge-neutral"
                  style={{ fontSize: '0.7rem', padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  title={`Logged in ${expenseCurr}, converted to ${groupBaseCurr}`}
                >
                  <Globe2 size={11} color="var(--primary)" />
                  {expenseCurr}
                </span>
              )}
            </div>

            <div className="expense-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                {expense.date}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CreditCard size={13} />
                Paid by{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {isUserPayer ? 'You' : payer?.name || 'Someone'}
                </strong>
              </span>
              {expense.splits?.length > 0 && (
                <>
                  <span>•</span>
                  <span>{expense.splits.length} people split</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amounts & User Balance Effect */}
        <div className="expense-right">
          <div className="amount-box">
            <div className="original-amount">
              {formatCurrency(expense.amount, expenseCurr)}
            </div>
            {isMultiCurrency && (
              <div className="converted-amount">
                ≈ {formatCurrency(convertedTotal, groupBaseCurr)}
              </div>
            )}
          </div>

          <div className="your-share-box">
            <span className={`badge-pill ${userEffectClass}`} style={{ fontSize: '0.78rem' }}>
              {userEffectText}
            </span>
          </div>

          <button
            className="btn-ghost"
            style={{ padding: '6px' }}
            title={expanded ? 'Collapse' : 'Expand details'}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Split Breakdown & Notes Drawer */}
      {expanded && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.18)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {expense.note && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <FileText size={15} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--primary)' }} />
              <span>{expense.note}</span>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Split Breakdown ({expense.splitType || 'equal'})
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {expense.splits?.map((split) => {
                const member = activeGroup?.members?.find((m) => m.id === split.memberId);
                const isCurrent = split.memberId === currentUser.id;
                const splitConverted = convertCurrency(
                  split.amount,
                  expenseCurr,
                  groupBaseCurr,
                  currencyRates
                );

                return (
                  <div
                    key={split.memberId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-card)',
                      border: `1px solid ${isCurrent ? 'var(--primary-glow)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={member?.name || 'Member'} emoji={member?.avatar} color={member?.color} size={24} />
                      <span style={{ fontSize: '0.84rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {isCurrent ? `${member?.name} (You)` : member?.name || 'Member'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                        {formatCurrency(split.amount, expenseCurr)}
                      </span>
                      {isMultiCurrency && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ≈ {formatCurrency(splitConverted, groupBaseCurr)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              id={`edit-expense-${expense.id}`}
              className="btn-ghost"
              style={{ fontSize: '0.82rem' }}
              onClick={handleEdit}
            >
              <Edit2 size={14} /> Edit Expense
            </button>
            <button
              id={`delete-expense-${expense.id}`}
              className="btn-ghost"
              style={{ fontSize: '0.82rem', color: 'var(--negative)' }}
              onClick={handleDelete}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
