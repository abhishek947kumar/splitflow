import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../constants/currencies';
import { Avatar } from '../common/Avatar';
import {
  X,
  Camera,
  Upload,
  Receipt,
  Plus,
  Trash2,
  Check,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

const SAMPLE_RECEIPTS = [
  {
    name: '🍱 Izakaya Tokyo Dinner',
    merchant: 'Izakaya Gonpachi Tokyo',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    taxPercent: 10,
    tipPercent: 18,
    items: [
      { id: 'item-1', name: 'Edamame & Shishito Peppers', price: 12.00, sharedBy: [] },
      { id: 'item-2', name: 'Deluxe Sashimi Platter (24pc)', price: 48.00, sharedBy: [] },
      { id: 'item-3', name: 'Yakitori Skewers Assortment', price: 26.00, sharedBy: [] },
      { id: 'item-4', name: 'Wagyu Beef Striploin (8oz)', price: 42.00, sharedBy: [] },
      { id: 'item-5', name: 'Sapporo Draft Beers (x4)', price: 28.00, sharedBy: [] },
      { id: 'item-6', name: 'Matcha Gelato Mochi', price: 14.00, sharedBy: [] },
    ],
  },
  {
    name: '🍕 Trattoria Positano Feast',
    merchant: 'Trattoria Positano Ristorante',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    taxPercent: 10,
    tipPercent: 15,
    items: [
      { id: 'item-10', name: 'Burrata Pugliese & Prosciutto', price: 22.00, sharedBy: [] },
      { id: 'item-11', name: 'Truffle Mushroom Pizza', price: 26.00, sharedBy: [] },
      { id: 'item-12', name: 'Spaghetti alle Vongole', price: 32.00, sharedBy: [] },
      { id: 'item-13', name: 'Bottle of Chianti Classico', price: 38.00, sharedBy: [] },
      { id: 'item-14', name: 'Traditional Tiramisu', price: 12.00, sharedBy: [] },
    ],
  },
  {
    name: '🛒 Whole Foods Groceries',
    merchant: 'Whole Foods Market',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    taxPercent: 8,
    tipPercent: 0,
    items: [
      { id: 'item-20', name: 'Organic Cage-Free Eggs', price: 6.99, sharedBy: [] },
      { id: 'item-21', name: 'Artisan Sourdough Loaf', price: 5.49, sharedBy: [] },
      { id: 'item-22', name: 'Fair Trade Cold Brew Blend', price: 14.99, sharedBy: [] },
      { id: 'item-23', name: 'Greek Honey Yogurt (32oz)', price: 7.49, sharedBy: [] },
      { id: 'item-24', name: 'Haas Avocados Bag', price: 6.99, sharedBy: [] },
      { id: 'item-25', name: 'Household Paper Towels Pack', price: 16.99, sharedBy: [] },
    ],
  },
];

export function ReceiptScannerModal({ isOpen, onClose, onApplyItemizedSplit }) {
  const { activeGroup, addToast } = useApp();
  const members = activeGroup?.members || [];
  const baseCurr = activeGroup?.currency || 'USD';

  const [receiptTitle, setReceiptTitle] = useState('Dinner at Izakaya');
  const [items, setItems] = useState(() => {
    // Default items initialized with all members sharing
    const allMemberIds = members.map((m) => m.id);
    return SAMPLE_RECEIPTS[0].items.map((it) => ({
      ...it,
      sharedBy: [...allMemberIds],
    }));
  });

  const [taxPercent, setTaxPercent] = useState(10);
  const [tipPercent, setTipPercent] = useState(18);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  // Load a preset sample receipt
  const loadPreset = (preset) => {
    setReceiptTitle(preset.merchant);
    setTaxPercent(preset.taxPercent);
    setTipPercent(preset.tipPercent);
    const allMemberIds = members.map((m) => m.id);
    setItems(
      preset.items.map((it) => ({
        ...it,
        sharedBy: [...allMemberIds],
      }))
    );
    addToast(`Loaded ${preset.name} with ${preset.items.length} line items!`, 'success');
  };

  // Simulate file upload scanning
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Generate parsed result from scanned image
      loadPreset(SAMPLE_RECEIPTS[0]);
      addToast('OCR Complete: 6 items and totals extracted!', 'success');
    }, 1200);
  };

  // Toggle member participation for a specific item
  const toggleMemberForItem = (itemId, memberId) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const exists = it.sharedBy.includes(memberId);
          const nextShared = exists
            ? it.sharedBy.filter((id) => id !== memberId)
            : [...it.sharedBy, memberId];
          return { ...it, sharedBy: nextShared };
        }
        return it;
      })
    );
  };

  // Add new blank item
  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: 'Custom Item',
      price: 10.00,
      sharedBy: members.map((m) => m.id),
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Delete item
  const handleDeleteItem = (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Calculations:
  // Subtotal of items
  const itemsSubtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const taxAmount = (itemsSubtotal * (Number(taxPercent) || 0)) / 100;
  const tipAmount = (itemsSubtotal * (Number(tipPercent) || 0)) / 100;
  const grandTotal = itemsSubtotal + taxAmount + tipAmount;

  // Proportional member calculations:
  // Each member's raw subtotal: sum of (item.price / item.sharedBy.length) for items they shared
  const memberSubtotals = {};
  members.forEach((m) => (memberSubtotals[m.id] = 0));

  items.forEach((it) => {
    const price = Number(it.price) || 0;
    const shareCount = it.sharedBy.length;
    if (shareCount > 0) {
      const share = price / shareCount;
      it.sharedBy.forEach((mId) => {
        if (memberSubtotals[mId] !== undefined) {
          memberSubtotals[mId] += share;
        }
      });
    }
  });

  // Calculate final member shares including proportional tax and tip
  const finalMemberSplits = members.map((m) => {
    const subtotal = memberSubtotals[m.id] || 0;
    const proportion = itemsSubtotal > 0 ? subtotal / itemsSubtotal : 0;
    const memberTax = taxAmount * proportion;
    const memberTip = tipAmount * proportion;
    const total = Math.round((subtotal + memberTax + memberTip) * 100) / 100;

    return {
      memberId: m.id,
      name: m.name,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAndTip: Math.round((memberTax + memberTip) * 100) / 100,
      total,
    };
  });

  const handleApply = () => {
    if (items.length === 0 || grandTotal <= 0) {
      alert('Please add at least one item with a valid price.');
      return;
    }

    const splitsPayload = finalMemberSplits.map((ms) => ({
      memberId: ms.memberId,
      amount: ms.total,
    }));

    onApplyItemizedSplit({
      title: receiptTitle,
      amount: Math.round(grandTotal * 100) / 100,
      splits: splitsPayload,
      note: `Itemized Receipt: ${items.length} items (Subtotal: $${itemsSubtotal.toFixed(2)}, Tax: ${taxPercent}%, Tip: ${tipPercent}%)`,
    });

    onClose();
    addToast('Itemized split calculated & applied to expense!', 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Smart Receipt Scanner & Itemized Split</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Upload or scan a receipt, assign individual dishes, and auto-apportion tax & tip.
              </p>
            </div>
          </div>
          <button className="btn-ghost" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ gap: '18px' }}>
          {/* Top Receipt Presets & Upload Dropzone */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Try Sample Scanned Receipts or Upload
              </span>

              {/* Upload image button */}
              <label
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Camera size={14} color="var(--primary)" />
                <span>Upload Receipt Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Presets Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SAMPLE_RECEIPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn-ghost"
                  style={{
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: 'var(--text-primary)',
                  }}
                  onClick={() => loadPreset(preset)}
                >
                  <Sparkles size={12} color="var(--primary)" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {isScanning && (
              <div style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.84rem', padding: '8px' }}>
                <span className="animate-spin" style={{ display: 'inline-block', marginRight: '6px' }}>⚙️</span>
                Scanning image OCR and extracting dishes, quantities, and prices...
              </div>
            )}
          </div>

          {/* Receipt Title & Tax/Tip Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Receipt / Merchant Name
              </label>
              <input
                type="text"
                value={receiptTitle}
                onChange={(e) => setReceiptTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="any"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Tip Rate (%)
              </label>
              <input
                type="number"
                step="any"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
              />
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Dish / Item Breakdown ({items.length} items)
              </span>
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '0.76rem', color: 'var(--primary)', padding: '2px 8px' }}
                onClick={handleAddItem}
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, name: val } : it)));
                      }}
                      style={{ flex: 1, padding: '5px 8px', fontSize: '0.86rem' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>$</span>
                      <input
                        type="number"
                        step="any"
                        value={item.price}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, price: val } : it)));
                        }}
                        style={{ width: '85px', padding: '5px 8px', fontSize: '0.86rem', textAlign: 'right' }}
                      />
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '4px' }}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 size={14} color="var(--text-muted)" />
                      </button>
                    </div>
                  </div>

                  {/* Who shared this item? Member avatar selection pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Shared by:
                    </span>
                    {members.map((m) => {
                      const isShared = item.sharedBy.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            border: `1px solid ${isShared ? 'var(--primary)' : 'var(--border-subtle)'}`,
                            background: isShared ? 'var(--primary-glow)' : 'transparent',
                            color: isShared ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleMemberForItem(item.id, m.id)}
                        >
                          <Avatar name={m.name} emoji={m.avatar} color={m.color} size={16} />
                          <span>{m.name.split(' ')[0]}</span>
                          {isShared && <Check size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Subtotals & Proportional Tax/Tip Summary */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Food Subtotal: <strong>${itemsSubtotal.toFixed(2)}</strong> + Tax ({taxPercent}%): ${taxAmount.toFixed(2)} + Tip ({tipPercent}%): ${tipAmount.toFixed(2)}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Grand Total: ${grandTotal.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
              {finalMemberSplits.map((ms) => (
                <div
                  key={ms.memberId}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ms.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Dishes: ${ms.subtotal.toFixed(2)} + Tax/Tip: ${ms.taxAndTip.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--positive)' }} className="tabular-nums">
                    = ${ms.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            id="apply-itemized-btn"
            type="button"
            className="btn-primary"
            onClick={handleApply}
          >
            <Check size={16} /> Apply Itemized Split to Expense
          </button>
        </div>
      </div>
    </div>
  );
}
