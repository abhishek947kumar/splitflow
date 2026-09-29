import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';
import {
  Users,
  Plus,
  Settings,
  RotateCcw,
  Sparkles,
  UserPlus,
  Compass,
} from 'lucide-react';

export function Sidebar() {
  const {
    groups,
    activeGroupId,
    setActiveGroupId,
    activeGroup,
    setCreateGroupModalOpen,
    setGroupSettingsModalOpen,
    addMemberToGroup,
    resetDemoData,
  } = useApp();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const handleQuickAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeGroup) return;

    // Pick avatar color from palette
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const emojis = ['🧑🏻‍💻', '👩🏽‍🎨', '🧔🏻', '👱🏼‍♀️', '🧑🏿‍🚀', '👨🏼‍🔬'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    addMemberToGroup(activeGroup.id, {
      name: newMemberName.trim(),
      avatar: randomEmoji,
      color: randomColor,
    });
    setNewMemberName('');
    setIsAddingMember(false);
  };

  return (
    <aside className="sidebar">
      {/* Groups Section */}
      <div>
        <div className="sidebar-section-title">
          <span>Your Groups ({groups.length})</span>
          <button
            id="sidebar-create-group-btn"
            className="btn-ghost"
            style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--primary)' }}
            onClick={() => setCreateGroupModalOpen(true)}
            title="Create a new expense group"
          >
            <Plus size={14} /> New
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {groups.map((grp) => {
            const isActive = grp.id === activeGroupId;
            return (
              <div
                key={grp.id}
                id={`sidebar-group-${grp.id}`}
                className={`group-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveGroupId(grp.id)}
              >
                <span className="group-icon">{grp.emoji}</span>
                <div className="group-details">
                  <div className="group-name">{grp.name}</div>
                  <div className="group-meta">
                    <span>{grp.members?.length || 0} members</span>
                    <span>•</span>
                    <span>{grp.currency}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Group Members Section */}
      {activeGroup && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
          <div className="sidebar-section-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} /> Group Members ({activeGroup.members?.length || 0})
            </span>
            <button
              id="sidebar-group-settings-btn"
              className="btn-ghost"
              style={{ padding: '2px', color: 'var(--text-muted)' }}
              onClick={() => setGroupSettingsModalOpen(true)}
              title="Group Settings & Currency"
            >
              <Settings size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeGroup.members?.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <Avatar name={member.name} emoji={member.avatar} color={member.color} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.name}
                  </div>
                  {member.email && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.email}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Add Member Form */}
            {isAddingMember ? (
              <form onSubmit={handleQuickAddMember} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  id="sidebar-new-member-input"
                  type="text"
                  placeholder="Member name or nickname"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  autoFocus
                  style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.8rem', justifyContent: 'center' }}>
                    Add
                  </button>
                  <button type="button" className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => setIsAddingMember(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                id="sidebar-add-member-btn"
                className="btn-ghost"
                style={{
                  marginTop: '4px',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 10px',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
                onClick={() => setIsAddingMember(true)}
              >
                <UserPlus size={14} /> Add Member (No account needed)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guest Mode & Demo Reset Card */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
            <Sparkles size={15} />
            <span>Interactive Guest Mode</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Preloaded with Tokyo, Apartment, and Amalfi groups. Add, edit, or settle expenses freely!
          </p>
          <button
            id="sidebar-reset-demo-btn"
            className="btn-ghost"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              justifyContent: 'center',
              marginTop: '4px',
            }}
            onClick={resetDemoData}
            title="Reset all groups, expenses, and settlements to initial demo state"
          >
            <RotateCcw size={12} /> Reset Demo Data
          </button>
        </div>
      </div>
    </aside>
  );
}
