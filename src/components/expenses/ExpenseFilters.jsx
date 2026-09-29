import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../constants/categories';
import { Search, Filter, Calendar, Users, X } from 'lucide-react';

export function ExpenseFilters() {
  const {
    activeGroup,
    filterCategory,
    setFilterCategory,
    filterDateRange,
    setFilterDateRange,
    filterMemberId,
    setFilterMemberId,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const isFiltered =
    filterCategory !== 'all' ||
    filterDateRange !== 'all' ||
    filterMemberId !== 'all' ||
    searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setFilterCategory('all');
    setFilterDateRange('all');
    setFilterMemberId('all');
    setSearchQuery('');
  };

  return (
    <div className="expenses-toolbar">
      {/* Top Search & Dropdown Filters Bar */}
      <div className="search-and-filters">
        {/* Search Input */}
        <div className="search-box">
          <Search size={16} className="search-box-icon" />
          <input
            id="expense-search-input"
            type="text"
            placeholder="Search expenses by title or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Member Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={15} color="var(--text-muted)" />
          <select
            id="expense-member-filter-select"
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '8px 12px' }}
          >
            <option value="all">All Members</option>
            {activeGroup?.members?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="var(--text-muted)" />
          <select
            id="expense-date-filter-select"
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '8px 12px' }}
          >
            <option value="all">All Time</option>
            <option value="7days">Past 7 Days</option>
            <option value="30days">Past 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        {isFiltered && (
          <button
            id="expense-clear-filters-btn"
            className="btn-ghost"
            style={{ fontSize: '0.8rem', color: 'var(--negative)' }}
            onClick={clearAllFilters}
          >
            <X size={14} /> Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="category-chips">
        <button
          className={`category-chip ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          <span>🌐</span> All Categories
        </button>

        {CATEGORIES.map((cat) => {
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat.id)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
