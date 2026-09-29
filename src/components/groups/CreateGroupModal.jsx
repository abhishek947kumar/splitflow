import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCIES } from '../../constants/currencies';
import { X, Plus, Trash2, Users } from 'lucide-react';

const GROUP_CATEGORIES = [
  { id: 'trip', name: 'Trip & Travel', emoji: '✈️' },
  { id: 'home', name: 'Home & Roommates', emoji: '🏠' },
  { id: 'couple', name: 'Couple & Partner', emoji: '❤️' },
  { id: 'event', name: 'Event & Party', emoji: '🎉' },
  { id: 'dining', name: 'Dining Club', emoji: '🍷' },
  { id: 'project', name: 'Project & Work', emoji: '💼' },
];

const EMOJI_OPTIONS = ['🗼', '🏠', '🍋', '🌴', '🍕', '🚗', '🏔️', '🏖️', '✈️', '⛵', '🍻', '🎸'];

export function CreateGroupModal() {
  const {
    createGroupModalOpen,
    setCreateGroupModalOpen,
    currentUser,
    addGroup,
  } = useApp();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌴');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('trip');
  const [description, setDescription] = useState('');
  const [initialMembers, setInitialMembers] = useState(['', '']);

  if (!createGroupModalOpen) return null;

  const handleClose = () => {
    setCreateGroupModalOpen(false);
    setName('');
    setDescription('');
    setInitialMembers(['', '']);
  };

  const handleMemberChange = (idx, val) => {
    const next = [...initialMembers];
    next[idx] = val;
    setInitialMembers(next);
  };

  const addMemberField = () => {
    setInitialMembers((prev) => [...prev, '']);
  };

  const removeMemberField = (idx) => {
    setInitialMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a group name.');
      return;
    }

    const memberColors = ['#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];

    // Creator is member #1
    const membersList = [
      {
        id: currentUser.id,
        name: `${currentUser.name.split(' ')[0]} (You)`,
        email: currentUser.email,
        avatar: currentUser.avatar,
        color: currentUser.color,
        isUser: true,
      },
    ];

    // Add valid extra members
    initialMembers.forEach((memName, idx) => {
      const clean = memName.trim();
      if (clean) {
        membersList.push({
          id: `u-${Date.now()}-${idx}`,
          name: clean,
          email: '',
          avatar: '👤',
          color: memberColors[idx % memberColors.length],
        });
      }
    });

    addGroup({
      name: name.trim(),
      emoji,
      category,
      currency,
      description: description.trim(),
      members: membersList,
    });

    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Create New Group</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Set up a shared cost group for your next trip, home, or event.
            </p>
          </div>
          <button
            id="close-create-group-btn"
            className="btn-ghost"
            style={{ padding: '6px' }}
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Emoji & Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Group Icon & Name *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  style={{ width: '64px', fontSize: '1.3rem', textAlign: 'center' }}
                >
                  {EMOJI_OPTIONS.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
                <input
                  id="create-group-name-input"
                  type="text"
                  placeholder="e.g. Barcelona Summer Vacation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Currency & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Default Currency
                </label>
                <select
                  id="create-group-currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  id="create-group-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {GROUP_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Description (Optional)
              </label>
              <input
                id="create-group-desc-input"
                type="text"
                placeholder="e.g. Flights, beach villa, dining & car rentals"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Initial Members */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Add Friends / Members (No accounts required)
                </label>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '0.76rem', color: 'var(--primary)', padding: '2px 6px' }}
                  onClick={addMemberField}
                >
                  <Plus size={13} /> Add More
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', padding: '6px 10px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <span>👩🏼‍💻</span>
                  <span style={{ fontWeight: 600 }}>{currentUser.name} (You)</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Admin</span>
                </div>

                {initialMembers.map((memName, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={`Friend #${idx + 1} name`}
                      value={memName}
                      onChange={(e) => handleMemberChange(idx, e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.86rem' }}
                    />
                    {initialMembers.length > 1 && (
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => removeMemberField(idx)}
                      >
                        <Trash2 size={15} color="var(--text-muted)" />
                      </button>
                    )}
                  </div>
                ))}
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
              id="confirm-create-group-btn"
              type="submit"
              className="btn-primary"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
