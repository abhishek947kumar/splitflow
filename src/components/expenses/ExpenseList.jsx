import React from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseItem } from './ExpenseItem';
import { RecurringExpensesSection } from './RecurringExpensesSection';
import { Receipt, Plus, SearchX } from 'lucide-react';

export function ExpenseList() {
  const {
    filteredExpenses,
    activeGroupAllExpenses,
    setExpenseModalOpen,
    setEditingExpense,
  } = useApp();

  return (
    <div className="expenses-view-container animate-fade">
      {/* Search and Filters Toolbar */}
      <ExpenseFilters />

      {/* Recurring Bills & Subscriptions Section */}
      <RecurringExpensesSection />

      {/* Expenses Feed */}
      {filteredExpenses.length > 0 ? (
        <div className="expenses-feed" style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </div>
      ) : activeGroupAllExpenses.length === 0 ? (
        /* Empty Group State */
        <div
          className="glass-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Receipt size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Expenses Logged Yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem' }}>
              Keep everyone on the same page. Add dinner bills, flight tickets, groceries, or rental costs!
            </p>
          </div>
          <button
            id="empty-add-expense-btn"
            className="btn-primary"
            onClick={() => {
              setEditingExpense(null);
              setExpenseModalOpen(true);
            }}
          >
            <Plus size={16} /> Add First Expense
          </button>
        </div>
      ) : (
        /* Filtered Empty State */
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
          <SearchX size={36} color="var(--text-muted)" />
          <h4 style={{ fontSize: '1.05rem' }}>No expenses match your filters</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Try adjusting your search query, category selection, or date range.
          </p>
        </div>
      )}
    </div>
  );
}
