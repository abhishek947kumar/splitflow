import React from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, ArrowLeftRight, PieChart, Plus, Users } from 'lucide-react';

export function MobileNav() {
  const { activeTab, setActiveTab, setExpenseModalOpen, setEditingExpense, setCreateGroupModalOpen } = useApp();

  return (
    <nav className="mobile-nav-bar">
      <button
        id="mob-tab-expenses"
        className={`btn-ghost ${activeTab === 'expenses' ? 'active' : ''}`}
        style={{ flexDirection: 'column', gap: '3px', fontSize: '0.72rem', color: activeTab === 'expenses' ? 'var(--primary)' : 'var(--text-muted)' }}
        onClick={() => setActiveTab('expenses')}
      >
        <Receipt size={18} />
        <span>Expenses</span>
      </button>

      <button
        id="mob-tab-settlements"
        className={`btn-ghost ${activeTab === 'settlements' ? 'active' : ''}`}
        style={{ flexDirection: 'column', gap: '3px', fontSize: '0.72rem', color: activeTab === 'settlements' ? 'var(--primary)' : 'var(--text-muted)' }}
        onClick={() => setActiveTab('settlements')}
      >
        <ArrowLeftRight size={18} />
        <span>Settle Up</span>
      </button>

      {/* Floating Add Expense Action Button */}
      <button
        id="mob-fab-add-expense"
        className="mobile-fab"
        onClick={() => {
          setEditingExpense(null);
          setExpenseModalOpen(true);
        }}
        title="Add Expense"
      >
        <Plus size={24} />
      </button>

      <button
        id="mob-tab-analytics"
        className={`btn-ghost ${activeTab === 'analytics' ? 'active' : ''}`}
        style={{ flexDirection: 'column', gap: '3px', fontSize: '0.72rem', color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-muted)' }}
        onClick={() => setActiveTab('analytics')}
      >
        <PieChart size={18} />
        <span>Analytics</span>
      </button>

      <button
        id="mob-tab-groups"
        className="btn-ghost"
        style={{ flexDirection: 'column', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)' }}
        onClick={() => setCreateGroupModalOpen(true)}
      >
        <Users size={18} />
        <span>New Group</span>
      </button>
    </nav>
  );
}
