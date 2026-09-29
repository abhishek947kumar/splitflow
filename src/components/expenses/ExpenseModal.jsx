import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCIES, getCurrencyInfo, formatCurrency } from '../../constants/currencies';
import { CATEGORIES, suggestCategory } from '../../constants/categories';
import { convertCurrency, getExchangeRate } from '../../services/currencyService';
import { Avatar } from '../common/Avatar';
import { ReceiptScannerModal } from './ReceiptScannerModal';
import {
  X,
  Globe2,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  HelpCircle,
  Divide,
  Percent,
  Scale,
  Equal,
  Camera,
} from 'lucide-react';

export function ExpenseModal() {
  const {
    activeGroup,
    currentUser,
    expenseModalOpen,
    setExpenseModalOpen,
    editingExpense,
    setEditingExpense,
    addExpense,
    updateExpense,
    currencyRates,
  } = useApp();

  const groupBaseCurr = activeGroup?.currency || 'USD';
  const members = activeGroup?.members || [];

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(groupBaseCurr);
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Split mode: 'equal' | 'exact' | 'percentage' | 'shares'
  const [splitType, setSplitType] = useState('equal');

  // Equal split: which members are included
  const [includedMembers, setIncludedMembers] = useState({});

  // Exact split: exact amount per member
  const [exactAmounts, setExactAmounts] = useState({});

  // Percentage split: percentage per member
  const [percentages, setPercentages] = useState({});

  // Shares split: shares per member
  const [shares, setShares] = useState({});

  // Custom Exchange Rate override
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState('');

  // Multi-payer mode
  const [multiplePayers, setMultiplePayers] = useState(false);
  const [payerAmounts, setPayerAmounts] = useState({});

  // Receipt Scanner modal state
  const [receiptScannerOpen, setReceiptScannerOpen] = useState(false);

  const handleApplyItemized = (data) => {
    setTitle(data.title || 'Dinner & Drinks');
    setAmount(String(data.amount || ''));
    setCategory('food');
    setSplitType('exact');
    setNote(data.note || '');

    const nextExact = {};
    (data.splits || []).forEach((s) => {
      nextExact[s.memberId] = String(s.amount);
    });
    setExactAmounts(nextExact);
  };

  // Reset or Populate form when modal opens or editingExpense changes
  useEffect(() => {
    if (!expenseModalOpen) return;

    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setAmount(String(editingExpense.amount || ''));
      setCurrency(editingExpense.currency || groupBaseCurr);
      setCategory(editingExpense.category || 'general');
      setPaidBy(editingExpense.paidBy || currentUser.id);
      setDate(editingExpense.date || new Date().toISOString().split('T')[0]);
      setNote(editingExpense.note || '');
      setSplitType(editingExpense.splitType || 'equal');

      // Populate splits
      const inc = {};
      const exact = {};
      const pct = {};
      const shr = {};

      members.forEach((m) => {
        const found = (editingExpense.splits || []).find((s) => s.memberId === m.id);
        if (found) {
          inc[m.id] = true;
          exact[m.id] = String(found.amount || '');
          if (found.shares) shr[m.id] = found.shares;
        } else {
          inc[m.id] = false;
          exact[m.id] = '';
          shr[m.id] = 1;
        }
      });

      setIncludedMembers(inc);
      setExactAmounts(exact);
      setShares(shr);
    } else {
      // New expense defaults
      setTitle('');
      setAmount('');
      setCurrency(groupBaseCurr);
      setCategory('food');
      setPaidBy(currentUser.id);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setSplitType('equal');

      // Default include all members equally
      const inc = {};
      const shr = {};
      members.forEach((m) => {
        inc[m.id] = true;
        shr[m.id] = 1;
      });
      setIncludedMembers(inc);
      setShares(shr);
      setExactAmounts({});
      setPercentages({});
    }
  }, [expenseModalOpen, editingExpense, groupBaseCurr, currentUser.id, members]);

  // Smart Category auto-suggest when typing title
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!editingExpense && val.length > 2) {
      const suggested = suggestCategory(val);
      if (suggested && suggested !== 'general') {
        setCategory(suggested);
      }
    }
  };

  // Live Exchange Rate calculation
  const isMultiCurrency = currency !== groupBaseCurr;
  const standardRate = getExchangeRate(currency, groupBaseCurr, currencyRates);
  const effectiveRate = useCustomRate && Number(customRate) > 0 ? Number(customRate) : standardRate;
  const totalInGroupBase = (Number(amount) || 0) * effectiveRate;

  // Split Calculations & Validations
  const parsedAmount = Number(amount) || 0;

  // 1. Equal Split calculation
  const activeCount = members.filter((m) => includedMembers[m.id]).length;
  const equalShare = activeCount > 0 ? Math.round((parsedAmount / activeCount) * 100) / 100 : 0;

  // 2. Exact Split validation
  const exactSum = members.reduce((sum, m) => sum + (Number(exactAmounts[m.id]) || 0), 0);
  const exactDiff = Math.round((parsedAmount - exactSum) * 100) / 100;

  // 3. Percentage Split validation
  const percentSum = members.reduce((sum, m) => sum + (Number(percentages[m.id]) || 0), 0);
  const percentDiff = Math.round((100 - percentSum) * 10) / 10;

  // 4. Shares Split calculation
  const totalShares = members.reduce((sum, m) => sum + (Number(shares[m.id]) || 0), 0);

  // Switch to Exact split helper: auto-prefill remaining
  const handleAutoFillRemainingExact = (targetMemberId) => {
    const othersSum = members
      .filter((m) => m.id !== targetMemberId)
      .reduce((sum, m) => sum + (Number(exactAmounts[m.id]) || 0), 0);
    const rem = Math.max(0, Math.round((parsedAmount - othersSum) * 100) / 100);
    setExactAmounts((prev) => ({ ...prev, [targetMemberId]: String(rem) }));
  };

  // Helper when user clicks "Exact" tab: auto populate equal shares as baseline
  const handleTabChange = (newType) => {
    setSplitType(newType);
    if (newType === 'exact' && (!exactSum || exactSum === 0) && parsedAmount > 0) {
      const initialExact = {};
      const share = Math.round((parsedAmount / (members.length || 1)) * 100) / 100;
      members.forEach((m, idx) => {
        if (idx === members.length - 1) {
          const prevSum = share * (members.length - 1);
          initialExact[m.id] = String(Math.round((parsedAmount - prevSum) * 100) / 100);
        } else {
          initialExact[m.id] = String(share);
        }
      });
      setExactAmounts(initialExact);
    } else if (newType === 'percentage' && (!percentSum || percentSum === 0)) {
      const initialPct = {};
      const basePct = Math.round((100 / (members.length || 1)) * 10) / 10;
      members.forEach((m) => {
        initialPct[m.id] = String(basePct);
      });
      setPercentages(initialPct);
    }
  };

  const handleClose = () => {
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an expense title.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    // Build splits array based on chosen split type
    let finalSplits = [];

    if (splitType === 'equal') {
      if (activeCount === 0) {
        alert('Please select at least one person to split the expense with.');
        return;
      }
      let allocated = 0;
      const checkedMembers = members.filter((m) => includedMembers[m.id]);
      checkedMembers.forEach((m, idx) => {
        if (idx === checkedMembers.length - 1) {
          const lastAmount = Math.round((parsedAmount - allocated) * 100) / 100;
          finalSplits.push({ memberId: m.id, amount: lastAmount });
        } else {
          finalSplits.push({ memberId: m.id, amount: equalShare });
          allocated += equalShare;
        }
      });
    } else if (splitType === 'exact') {
      if (Math.abs(exactDiff) > 0.05) {
        alert(`The exact amounts must equal the total expense amount. Remaining: ${exactDiff}`);
        return;
      }
      members.forEach((m) => {
        const val = Number(exactAmounts[m.id]) || 0;
        if (val > 0) {
          finalSplits.push({ memberId: m.id, amount: val });
        }
      });
    } else if (splitType === 'percentage') {
      if (Math.abs(percentDiff) > 0.5) {
        alert(`Percentages must add up to 100%. Currently: ${percentSum}%`);
        return;
      }
      let allocated = 0;
      members.forEach((m, idx) => {
        const pct = Number(percentages[m.id]) || 0;
        if (pct > 0) {
          if (idx === members.length - 1) {
            const lastAmount = Math.round((parsedAmount - allocated) * 100) / 100;
            finalSplits.push({ memberId: m.id, amount: lastAmount, percentage: pct });
          } else {
            const calculated = Math.round(((pct / 100) * parsedAmount) * 100) / 100;
            finalSplits.push({ memberId: m.id, amount: calculated, percentage: pct });
            allocated += calculated;
          }
        }
      });
    } else if (splitType === 'shares') {
      if (totalShares <= 0) {
        alert('Total shares must be greater than zero.');
        return;
      }
      let allocated = 0;
      members.forEach((m, idx) => {
        const shareCount = Number(shares[m.id]) || 0;
        if (shareCount > 0) {
          if (idx === members.length - 1) {
            const lastAmount = Math.round((parsedAmount - allocated) * 100) / 100;
            finalSplits.push({ memberId: m.id, amount: lastAmount, shares: shareCount });
          } else {
            const calculated = Math.round(((shareCount / totalShares) * parsedAmount) * 100) / 100;
            finalSplits.push({ memberId: m.id, amount: calculated, shares: shareCount });
            allocated += calculated;
          }
        }
      });
    }

    const expensePayload = {
      groupId: activeGroup.id,
      title: title.trim(),
      amount: parsedAmount,
      currency,
      category,
      paidBy,
      date,
      note: note.trim(),
      splitType,
      splits: finalSplits,
      customRate: useCustomRate ? effectiveRate : undefined,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expensePayload);
    } else {
      addExpense(expensePayload);
    }

    handleClose();
  };

  if (!expenseModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>
              {editingExpense ? 'Edit Expense' : 'Log New Expense'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              In group: <strong>{activeGroup?.name}</strong>
            </p>
          </div>
          <button
            id="close-expense-modal-btn"
            className="btn-ghost"
            style={{ padding: '6px' }}
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick Action: Scan Receipt & Itemized Bill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} color="var(--positive)" />
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Have a restaurant receipt or grocery bill?</span>
              </div>
              <button
                id="open-receipt-scanner-btn"
                type="button"
                className="btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '5px 12px',
                  background: 'var(--positive-bg)',
                  borderColor: 'var(--positive-border)',
                  color: 'var(--positive)',
                  fontWeight: 700,
                }}
                onClick={() => setReceiptScannerOpen(true)}
              >
                <Sparkles size={12} /> Scan / Itemize Bill
              </button>
            </div>

            {/* Title & Category Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Expense Title *
                </label>
                <input
                  id="expense-title-input"
                  type="text"
                  placeholder="e.g. Shibuya Omakase, Airbnb, Taxi"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  id="expense-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount & Currency Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Amount *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="expense-amount-input"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ fontSize: '1.3rem', fontWeight: 700, paddingLeft: '14px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Currency
                </label>
                <select
                  id="expense-currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ height: '46px' }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Multi-Currency Conversion Info Banner */}
            {isMultiCurrency && (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600 }}>
                    <Globe2 size={16} />
                    <span>Live Multi-Currency Conversion</span>
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    ≈ {formatCurrency(totalInGroupBase, groupBaseCurr)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>
                    Rate: 1 {currency} = {effectiveRate.toFixed(4)} {groupBaseCurr}
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.76rem' }}>
                    <input
                      type="checkbox"
                      checked={useCustomRate}
                      onChange={(e) => setUseCustomRate(e.target.checked)}
                    />
                    <span>Custom Rate</span>
                  </label>
                </div>
                {useCustomRate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.78rem' }}>1 {currency} =</span>
                    <input
                      type="number"
                      step="any"
                      placeholder={standardRate.toFixed(4)}
                      value={customRate}
                      onChange={(e) => setCustomRate(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.82rem', width: '110px' }}
                    />
                    <span style={{ fontSize: '0.78rem' }}>{groupBaseCurr}</span>
                  </div>
                )}
              </div>
            )}

            {/* Paid By Selection & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Paid By
                </label>
                <select
                  id="expense-paid-by-select"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === currentUser.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date
                </label>
                <input
                  id="expense-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Split Mode Selector Tabs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Split Method
                </label>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {splitType === 'equal' && 'Splits evenly among selected'}
                  {splitType === 'exact' && 'Specify exact currency amounts'}
                  {splitType === 'percentage' && 'Split by custom percentages'}
                  {splitType === 'shares' && 'Split by family/weighted shares'}
                </span>
              </div>

              <div className="split-mode-selector">
                <button
                  type="button"
                  id="split-tab-equal"
                  className={`split-mode-btn ${splitType === 'equal' ? 'active' : ''}`}
                  onClick={() => handleTabChange('equal')}
                >
                  <Equal size={14} /> Equal
                </button>
                <button
                  type="button"
                  id="split-tab-exact"
                  className={`split-mode-btn ${splitType === 'exact' ? 'active' : ''}`}
                  onClick={() => handleTabChange('exact')}
                >
                  <Divide size={14} /> Exact $
                </button>
                <button
                  type="button"
                  id="split-tab-percentage"
                  className={`split-mode-btn ${splitType === 'percentage' ? 'active' : ''}`}
                  onClick={() => handleTabChange('percentage')}
                >
                  <Percent size={14} /> Percent %
                </button>
                <button
                  type="button"
                  id="split-tab-shares"
                  className={`split-mode-btn ${splitType === 'shares' ? 'active' : ''}`}
                  onClick={() => handleTabChange('shares')}
                >
                  <Scale size={14} /> Shares ⚖
                </button>
              </div>
            </div>

            {/* Split Breakdown Details Based on Split Type */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* EQUAL SPLIT VIEW */}
              {splitType === 'equal' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Each person pays: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(equalShare, currency)}</strong>
                    </span>
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ fontSize: '0.74rem', padding: '2px 6px' }}
                      onClick={() => {
                        const allTrue = {};
                        members.forEach((m) => (allTrue[m.id] = true));
                        setIncludedMembers(allTrue);
                      }}
                    >
                      Select All
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                    {members.map((m) => {
                      const isChecked = !!includedMembers[m.id];
                      return (
                        <label
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            border: `1px solid ${isChecked ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setIncludedMembers((prev) => ({ ...prev, [m.id]: e.target.checked }))
                            }
                          />
                          <Avatar name={m.name} emoji={m.avatar} color={m.color} size={24} />
                          <span style={{ fontSize: '0.84rem', fontWeight: isChecked ? 600 : 400 }}>
                            {m.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EXACT AMOUNT SPLIT VIEW */}
              {splitType === 'exact' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: Math.abs(exactDiff) < 0.01 ? 'var(--positive-bg)' : 'var(--warning-bg)',
                      border: `1px solid ${Math.abs(exactDiff) < 0.01 ? 'var(--positive-border)' : 'var(--warning-border)'}`,
                      fontSize: '0.82rem',
                    }}
                  >
                    <span>
                      Total Entered: <strong>{formatCurrency(exactSum, currency)}</strong> of {formatCurrency(parsedAmount, currency)}
                    </span>
                    <span>
                      {Math.abs(exactDiff) < 0.01 ? (
                        <span style={{ color: 'var(--positive)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Balanced
                        </span>
                      ) : exactDiff > 0 ? (
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                          Remaining: {formatCurrency(exactDiff, currency)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--negative)', fontWeight: 600 }}>
                          Over by: {formatCurrency(Math.abs(exactDiff), currency)}
                        </span>
                      )}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {members.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          <Avatar name={m.name} emoji={m.avatar} color={m.color} size={28} />
                          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                            {getCurrencyInfo(currency).symbol}
                          </span>
                          <input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={exactAmounts[m.id] || ''}
                            onChange={(e) =>
                              setExactAmounts((prev) => ({ ...prev, [m.id]: e.target.value }))
                            }
                            style={{ width: '110px', padding: '6px 10px', fontSize: '0.88rem' }}
                          />
                          {exactDiff > 0 && (
                            <button
                              type="button"
                              className="btn-ghost"
                              style={{ fontSize: '0.74rem', padding: '4px 6px', color: 'var(--primary)' }}
                              onClick={() => handleAutoFillRemainingExact(m.id)}
                              title="Fill with remaining amount"
                            >
                              Auto
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PERCENTAGE SPLIT VIEW */}
              {splitType === 'percentage' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: Math.abs(percentDiff) < 0.1 ? 'var(--positive-bg)' : 'var(--warning-bg)',
                      border: `1px solid ${Math.abs(percentDiff) < 0.1 ? 'var(--positive-border)' : 'var(--warning-border)'}`,
                      fontSize: '0.82rem',
                    }}
                  >
                    <span>
                      Total Percent: <strong>{percentSum.toFixed(1)}%</strong> / 100%
                    </span>
                    <span>
                      {Math.abs(percentDiff) < 0.1 ? (
                        <span style={{ color: 'var(--positive)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> 100% Balanced
                        </span>
                      ) : percentDiff > 0 ? (
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                          {percentDiff.toFixed(1)}% left
                        </span>
                      ) : (
                        <span style={{ color: 'var(--negative)', fontWeight: 600 }}>
                          {(Math.abs(percentDiff)).toFixed(1)}% over
                        </span>
                      )}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {members.map((m) => {
                      const pct = Number(percentages[m.id]) || 0;
                      const calculatedVal = parsedAmount > 0 ? (pct / 100) * parsedAmount : 0;
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            <Avatar name={m.name} emoji={m.avatar} color={m.color} size={28} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              = {formatCurrency(calculatedVal, currency)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                value={percentages[m.id] || ''}
                                onChange={(e) =>
                                  setPercentages((prev) => ({ ...prev, [m.id]: e.target.value }))
                                }
                                style={{ width: '80px', padding: '6px 8px', fontSize: '0.88rem' }}
                              />
                              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SHARES SPLIT VIEW */}
              {splitType === 'shares' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>
                      Total Shares: <strong>{totalShares}</strong>
                    </span>
                    <span>
                      1 share = {totalShares > 0 ? formatCurrency(parsedAmount / totalShares, currency) : '—'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {members.map((m) => {
                      const shareCount = Number(shares[m.id]) || 0;
                      const calculatedVal = totalShares > 0 ? (shareCount / totalShares) * parsedAmount : 0;
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            <Avatar name={m.name} emoji={m.avatar} color={m.color} size={28} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.name}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              = {formatCurrency(calculatedVal, currency)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', borderRadius: '4px' }}
                                onClick={() =>
                                  setShares((prev) => ({ ...prev, [m.id]: Math.max(0, (prev[m.id] || 0) - 1) }))
                                }
                              >
                                <Minus size={12} />
                              </button>
                              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                                {shareCount}
                              </span>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', borderRadius: '4px' }}
                                onClick={() =>
                                  setShares((prev) => ({ ...prev, [m.id]: (prev[m.id] || 0) + 1 }))
                                }
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Optional Note / Receipt details
              </label>
              <input
                id="expense-note-input"
                type="text"
                placeholder="e.g. Receipt photo on group drive, included 18% tip"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              id="submit-expense-btn"
              type="submit"
              className="btn-primary"
            >
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>

      {/* Itemized Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={receiptScannerOpen}
        onClose={() => setReceiptScannerOpen(false)}
        onApplyItemizedSplit={handleApplyItemized}
      />
    </div>
  );
}
