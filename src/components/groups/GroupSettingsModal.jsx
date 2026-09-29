import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import { X, Plus, Trash2, AlertTriangle, Globe2 } from 'lucide-react';

export function GroupSettingsModal() {
  const {
    activeGroup,
    groupSettingsModalOpen,
    setGroupSettingsModalOpen,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
  } = useApp();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');

  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    if (activeGroup && groupSettingsModalOpen) {
      setName(activeGroup.name || '');
      setEmoji(activeGroup.emoji || '📁');
      setCurrency(activeGroup.currency || 'USD');
      setDescription(activeGroup.description || '');
      setNewMemberName('');
    }
  }, [activeGroup, groupSettingsModalOpen]);

  if (!groupSettingsModalOpen || !activeGroup) return null;

  const handleClose = () => {
    setGroupSettingsModalOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateGroup(activeGroup.id, {
      name: name.trim(),
      emoji,
      currency,
      description: description.trim(),
    });
    handleClose();
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    addMemberToGroup(activeGroup.id, {
      name: newMemberName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      avatar: '👤',
    });
    setNewMemberName('');
  };

  const handleDeleteGroup = () => {
    if (window.confirm(`Are you sure you want to delete "${activeGroup.name}"? All associated expenses and settlements will be removed.`)) {
      deleteGroup(activeGroup.id);
      handleClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Group Settings</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Manage {activeGroup.name}
            </p>
          </div>
          <button
            id="close-group-settings-btn"
            className="btn-ghost"
            style={{ padding: '6px' }}
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Name & Emoji */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Group Icon & Name
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  style={{ width: '56px', textAlign: 'center', fontSize: '1.2rem' }}
                />
                <input
                  id="group-settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
              </div>
            </div>

            {/* Base Currency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Group Base Currency
              </label>
              <select
                id="group-settings-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <Globe2 size={13} color="var(--primary)" />
                <span>All balances and settlement amounts are calculated in this base currency.</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional group description"
              />
            </div>

            {/* Group Members List */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Group Members ({activeGroup.members?.length || 0})
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {activeGroup.members?.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={m.name} emoji={m.avatar} color={m.color} size={28} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.name}</span>
                    </div>
                    {m.isUser && (
                      <span className="badge-pill badge-neutral" style={{ fontSize: '0.7rem' }}>
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Add member inline form */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="New member name..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  style={{ flex: 1, padding: '7px 12px', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                  onClick={handleAddMember}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Danger Zone: Delete Group */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--negative)' }}>Delete Group</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Permanently deletes this group and its expenses.</div>
                </div>
                <button
                  id="delete-group-btn"
                  type="button"
                  className="btn-ghost"
                  style={{ color: 'var(--negative)', border: '1px solid var(--negative-border)', fontSize: '0.8rem' }}
                  onClick={handleDeleteGroup}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              id="save-group-settings-btn"
              type="submit"
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
