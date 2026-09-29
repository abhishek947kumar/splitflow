import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import { X, Check, Sparkles, UserCheck } from 'lucide-react';

const USER_AVATARS = ['👩🏼‍💻', '👨🏻‍🎨', '🧔🏽‍♂️', '👩🏻‍🦰', '🧑🏽‍💻', '👱🏻‍♂️', '👨🏽‍🍳', '👩🏼‍🎨', '🧑🏻‍🚀', '🦸🏻‍♀️', '👑', '🚀'];
const COLOR_PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];

export function UserProfileModal() {
  const {
    userProfileModalOpen,
    setUserProfileModalOpen,
    currentUser,
    setCurrentUser,
    activeGroup,
    switchCurrentUser,
    addToast,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('👩🏼‍💻');
  const [color, setColor] = useState('#10b981');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');

  useEffect(() => {
    if (userProfileModalOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setAvatar(currentUser.avatar || '👩🏼‍💻');
      setColor(currentUser.color || '#10b981');
      setPreferredCurrency(currentUser.preferredCurrency || 'USD');
    }
  }, [userProfileModalOpen, currentUser]);

  if (!userProfileModalOpen) return null;

  const handleClose = () => {
    setUserProfileModalOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCurrentUser((prev) => ({
      ...prev,
      name: name.trim(),
      email: email.trim(),
      avatar,
      color,
      preferredCurrency,
    }));

    addToast('Profile updated!', 'success');
    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>User Profile & Identity</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Customize your profile or switch perspectives
            </p>
          </div>
          <button
            id="close-profile-modal-btn"
            className="btn-ghost"
            style={{ padding: '6px' }}
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Avatar Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Avatar name={name || 'User'} emoji={avatar} color={color} size={64} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {USER_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: avatar === av ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${avatar === av ? 'var(--primary)' : 'transparent'}`,
                    }}
                    onClick={() => setAvatar(av)}
                  >
                    {av}
                  </button>
                ))}
              </div>

              {/* Color swatch */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c ? '2px solid #fff' : 'none',
                      boxShadow: color === c ? '0 0 8px rgba(255, 255, 255, 0.6)' : 'none',
                    }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            {/* Name & Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Your Name
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                id="profile-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Preferred Currency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Preferred Currency
              </label>
              <select
                id="profile-currency-select"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Perspective Switcher inside modal */}
            {activeGroup?.members?.length > 1 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <UserCheck size={14} color="var(--primary)" />
                  <span>Switch Perspective to another member:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeGroup.members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`btn-ghost ${m.id === currentUser.id ? 'active' : ''}`}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        border: '1px solid var(--border-subtle)',
                        background: m.id === currentUser.id ? 'var(--primary-glow)' : 'transparent',
                        color: m.id === currentUser.id ? 'var(--primary)' : 'var(--text-primary)',
                      }}
                      onClick={() => {
                        switchCurrentUser(m.id);
                        handleClose();
                      }}
                    >
                      <Avatar name={m.name} emoji={m.avatar} color={m.color} size={18} />
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
              id="save-profile-btn"
              type="submit"
              className="btn-primary"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
