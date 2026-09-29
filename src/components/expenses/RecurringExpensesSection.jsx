import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import {
  Repeat,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Play,
  Sparkles,
} from 'lucide-react';

export function RecurringExpensesSection() {
  const {
    activeGroup,
    currentUser,
    addExpense,
    addToast,
  } = useApp();

  const baseCurr = activeGroup?.currency || 'USD';
  const members = activeGroup?.members || [];

  // Default recurring items tied to groups
  const [recurringList, setRecurringList] = useState([
    {
      id: 'rec-1',
      groupId: 'grp-apartment',
      title: 'Gigabit Fiber Internet 🌐',
      category: 'utilities',
      amount: 90,
      currency: 'USD',
      frequency: 'Monthly',
      paidBy: 'u-alex',
      splitType: 'equal',
      nextDueDate: '2026-10-05',
    },
    {
      id: 'rec-2',
      groupId: 'grp-apartment',
      title: 'Central Heating & Electric ⚡',
      category: 'utilities',
      amount: 147,
      currency: 'USD',
      frequency: 'Monthly',
      paidBy: 'u-jordan',
      splitType: 'equal',
      nextDueDate: '2026-10-19',
    },
    {
      id: 'rec-3',
      groupId: 'grp-tokyo',
      title: 'Pocket Wi-Fi Hotspot Rental 📶',
      category: 'utilities',
      amount: 45,
      currency: 'USD',
      frequency: 'Weekly',
      paidBy: 'u-sarah',
      splitType: 'equal',
      nextDueDate: '2026-10-02',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newFrequency, setNewFrequency] = useState('Monthly');

  // Filter recurring items for currently active group
  const groupRecurring = recurringList.filter((r) => r.groupId === activeGroup?.id);

  // 1-Click "Log Next Cycle Now"
  const handleLogCycle = (recItem) => {
    // Generate equal splits for all active group members
    const share = Math.round((Number(recItem.amount) / (members.length || 1)) * 100) / 100;
    const splits = members.map((m) => ({ memberId: m.id, amount: share }));

    addExpense({
      groupId: activeGroup.id,
      title: `${recItem.title} (${new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })})`,
      amount: Number(recItem.amount),
      currency: recItem.currency || baseCurr,
      category: recItem.category || 'utilities',
      paidBy: recItem.paidBy || currentUser.id,
      date: new Date().toISOString().split('T')[0],
      note: `Auto-logged from ${recItem.frequency} recurring template`,
      splitType: 'equal',
      splits,
    });

    addToast(`Logged cycle for ${recItem.title}!`, 'success');
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    const newItem = {
      id: `rec-${Date.now()}`,
      groupId: activeGroup.id,
      title: newTitle.trim(),
      category: 'utilities',
      amount: Number(newAmount),
      currency: baseCurr,
      frequency: newFrequency,
      paidBy: currentUser.id,
      splitType: 'equal',
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    setRecurringList((prev) => [...prev, newItem]);
    setNewTitle('');
    setNewAmount('');
    setIsAdding(false);
    addToast('Recurring bill template added', 'success');
  };

  const handleDelete = (id) => {
    setRecurringList((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div
      className="glass-card animate-fade"
      style={{
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(234, 179, 8, 0.14)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Repeat size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>Recurring Shared Bills & Subscriptions</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Track regular monthly Wi-Fi, rent, or utilities with 1-click cycle logging.
            </p>
          </div>
        </div>

        <button
          className="btn-ghost"
          style={{ fontSize: '0.8rem', color: 'var(--primary)', padding: '4px 10px' }}
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus size={14} /> Add Recurring Bill
        </button>
      </div>

      {/* Add new inline form */}
      {isAdding && (
        <form
          onSubmit={handleAddNew}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Bill Title (e.g. Netflix, Wi-Fi)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ flex: 2, minWidth: '180px', padding: '6px 10px', fontSize: '0.85rem' }}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            style={{ width: '100px', padding: '6px 10px', fontSize: '0.85rem' }}
            required
          />
          <select
            value={newFrequency}
            onChange={(e) => setNewFrequency(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
          <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            Save Bill
          </button>
          <button type="button" className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.82rem' }} onClick={() => setIsAdding(false)}>
            Cancel
          </button>
        </form>
      )}

      {/* Recurring Cards Grid */}
      {groupRecurring.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {groupRecurring.map((item) => {
            const payer = members.find((m) => m.id === item.paidBy);
            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span className="badge-pill badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      {item.frequency}
                    </span>
                    <span>•</span>
                    <span>Paid by {payer?.name?.split(' ')[0] || 'Someone'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem' }} className="tabular-nums">
                      {formatCurrency(item.amount, item.currency || baseCurr)}
                    </div>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{
                      fontSize: '0.74rem',
                      padding: '5px 10px',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      fontWeight: 600,
                    }}
                    onClick={() => handleLogCycle(item)}
                    title="Log this bill for the current period now"
                  >
                    <Play size={12} /> Log
                  </button>

                  <button
                    className="btn-ghost"
                    style={{ padding: '4px', color: 'var(--text-muted)' }}
                    onClick={() => handleDelete(item.id)}
                    title="Remove recurring template"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
          No recurring bills set up for {activeGroup?.name}. Click "+ Add Recurring Bill" above to track regular rent, Wi-Fi, or streaming.
        </div>
      )}
    </div>
  );
}
