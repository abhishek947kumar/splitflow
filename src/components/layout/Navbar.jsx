import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';
import {
  Plus,
  Moon,
  Sun,
  RefreshCw,
  Globe2,
  ChevronDown,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const {
    theme,
    toggleTheme,
    currentUser,
    switchCurrentUser,
    activeGroup,
    groups,
    setActiveGroupId,
    setExpenseModalOpen,
    setEditingExpense,
    setCreateGroupModalOpen,
    setUserProfileModalOpen,
    ratesMeta,
    loadRates,
    currencyRates,
  } = useApp();

  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };

  // Group default currency rate preview
  const baseCurr = activeGroup?.currency || 'USD';
  const jpyRate = currencyRates['JPY'] ? (currencyRates['JPY'] / (currencyRates[baseCurr] || 1)).toFixed(1) : '153.5';

  return (
    <header className="navbar">
      {/* Brand & Group Switcher */}
      <div className="brand-section">
        <div className="brand-logo" title="SplitFlow Expense Splitter">
          <span>⚡</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">SplitFlow</span>
            <span className="brand-tag">v2.0</span>
          </div>
        </div>

        {/* Group Selector Dropdown */}
        <div style={{ position: 'relative', marginLeft: '12px' }}>
          <button
            id="nav-group-select-btn"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.88rem' }}
            onClick={() => {
              setGroupDropdownOpen(!groupDropdownOpen);
              setUserDropdownOpen(false);
            }}
          >
            <span>{activeGroup?.emoji || '📁'}</span>
            <span style={{ fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeGroup?.name || 'Select Group'}
            </span>
            <ChevronDown size={14} />
          </button>

          {groupDropdownOpen && (
            <div
              className="glass-card animate-modal"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                width: '260px',
                zIndex: 60,
                padding: '8px',
                background: 'var(--bg-card-solid)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Switch Group
              </div>
              {groups.map((grp) => (
                <div
                  key={grp.id}
                  onClick={() => {
                    setActiveGroupId(grp.id);
                    setGroupDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: grp.id === activeGroup?.id ? 'var(--primary-glow)' : 'transparent',
                    color: grp.id === activeGroup?.id ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: grp.id === activeGroup?.id ? 600 : 400,
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{grp.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{grp.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{grp.members?.length || 0} members · {grp.currency}</div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0', paddingTop: '6px' }}>
                <button
                  id="nav-create-group-btn"
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => {
                    setGroupDropdownOpen(false);
                    setCreateGroupModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Create New Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Currency Ticker */}
      <div className="navbar-center">
        <div
          className="currency-live-pill"
          title={`ExchangeRate-API sync status: ${ratesMeta.isLive ? 'Live Active' : 'Fallback active'}. Last updated: ${new Date(ratesMeta.timestamp).toLocaleTimeString()}`}
        >
          <div className="currency-live-dot" />
          <Globe2 size={14} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>Multi-Currency</span>
          <span style={{ color: 'var(--text-muted)' }}>
            1 {baseCurr} ≈ {jpyRate} JPY
          </span>
          <button
            id="nav-refresh-rates-btn"
            className="currency-refresh-btn"
            title="Refresh Live Exchange Rates from ExchangeRate-API"
            onClick={() => loadRates(true)}
          >
            <RefreshCw size={13} className={ratesMeta.loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Right: User Perspective Switcher, Theme Toggle, Add Expense */}
      <div className="navbar-actions">
        {/* Viewing perspective switcher (Guest Mode feature: switch to any member) */}
        <div style={{ position: 'relative' }}>
          <button
            id="nav-user-perspective-btn"
            className="perspective-picker"
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setGroupDropdownOpen(false);
            }}
            title="Click to view the app through any member's eyes"
          >
            <Avatar name={currentUser.name} emoji={currentUser.avatar} color={currentUser.color} size={28} />
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div className="perspective-label">Viewing As</div>
              <div className="perspective-name">{currentUser.name.split(' ')[0]}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {userDropdownOpen && (
            <div
              className="glass-card animate-modal"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '250px',
                zIndex: 60,
                padding: '8px',
                background: 'var(--bg-card-solid)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={12} /> Switch Identity
              </div>
              {activeGroup?.members?.map((member) => (
                <div
                  key={member.id}
                  onClick={() => {
                    switchCurrentUser(member.id);
                    setUserDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: member.id === currentUser.id ? 'var(--primary-glow)' : 'transparent',
                    color: member.id === currentUser.id ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: member.id === currentUser.id ? 600 : 400,
                  }}
                >
                  <Avatar name={member.name} emoji={member.avatar} color={member.color} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem' }}>{member.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {member.id === currentUser.id ? 'Currently Active' : 'Switch to this view'}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0', paddingTop: '6px' }}>
                <button
                  id="nav-edit-profile-btn"
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.84rem' }}
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setUserProfileModalOpen(true);
                  }}
                >
                  <Sparkles size={14} color="var(--primary)" /> Edit User Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          id="nav-theme-toggle-btn"
          className="btn-ghost"
          style={{ padding: '8px', borderRadius: '50%' }}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* Add Expense Primary Button */}
        <button
          id="nav-add-expense-btn"
          className="btn-primary"
          onClick={handleOpenAddExpense}
        >
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
}
