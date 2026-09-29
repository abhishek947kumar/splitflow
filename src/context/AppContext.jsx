import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  DEFAULT_USER,
  INITIAL_GROUPS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
} from '../constants/sampleData';
import {
  fetchLiveRates,
  FALLBACK_RATES,
} from '../services/currencyService';
import {
  calculateGroupBalances,
  simplifyDebts,
  calculateDirectPairwiseDebts,
} from '../services/settlementEngine';
import { soundEffects } from '../services/soundService';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  GROUPS: 'splitflow_groups_v1',
  EXPENSES: 'splitflow_expenses_v1',
  SETTLEMENTS: 'splitflow_settlements_v1',
  ACTIVE_GROUP: 'splitflow_active_group_v1',
  CURRENT_USER: 'splitflow_user_v1',
  THEME: 'splitflow_theme_v1',
};

export function AppProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  });

  // Current User profile state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  // Groups state
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  // Active Group ID state
  const [activeGroupId, setActiveGroupId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_GROUP);
    return saved || INITIAL_GROUPS[0].id;
  });

  // Expenses state
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Settlements state
  const [settlements, setSettlements] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
  });

  // Currency Rates & Live Sync state
  const [currencyRates, setCurrencyRates] = useState(FALLBACK_RATES);
  const [ratesMeta, setRatesMeta] = useState({
    isLive: false,
    timestamp: Date.now(),
    loading: true,
    error: null,
  });

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'settlements' | 'analytics' | 'history'
  const [settlementViewMode, setSettlementViewMode] = useState('simplified'); // 'simplified' | 'pairwise'

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState(null);

  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [groupSettingsModalOpen, setGroupSettingsModalOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Settlement celebration receipt modal
  const [celebrationData, setCelebrationData] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all'); // 'all' | '7days' | '30days'
  const [filterMemberId, setFilterMemberId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  // Sync theme with DOM attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GROUP, activeGroupId);
  }, [activeGroupId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Fetch live exchange rates on mount
  const loadRates = useCallback(async (force = false) => {
    setRatesMeta((prev) => ({ ...prev, loading: true }));
    try {
      const result = await fetchLiveRates(force);
      setCurrencyRates(result.rates);
      setRatesMeta({
        isLive: result.isLive,
        timestamp: result.timestamp,
        loading: false,
        error: result.error || null,
      });
      if (force) {
        addToast('Live exchange rates updated successfully', 'success');
      }
    } catch (err) {
      setRatesMeta({
        isLive: false,
        timestamp: Date.now(),
        loading: false,
        error: err.message,
      });
    }
  }, [addToast]);

  useEffect(() => {
    loadRates(false);
  }, [loadRates]);

  // Active Group object
  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || groups[0] || null;
  }, [groups, activeGroupId]);

  // All Expenses for Active Group (unfiltered)
  const activeGroupAllExpenses = useMemo(() => {
    if (!activeGroup) return [];
    return expenses.filter((e) => e.groupId === activeGroup.id);
  }, [expenses, activeGroup]);

  // All Settlements for Active Group
  const activeGroupSettlements = useMemo(() => {
    if (!activeGroup) return [];
    return settlements.filter((s) => s.groupId === activeGroup.id);
  }, [settlements, activeGroup]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return activeGroupAllExpenses.filter((item) => {
      // Category filter
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false;
      }
      // Member filter (paid by or involved in split)
      if (filterMemberId !== 'all') {
        const isPayer = item.paidBy === filterMemberId;
        const isInvolved = (item.splits || []).some((s) => s.memberId === filterMemberId);
        if (!isPayer && !isInvolved) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const noteMatch = item.note?.toLowerCase().includes(q);
        if (!titleMatch && !noteMatch) return false;
      }
      // Date range filter
      if (filterDateRange !== 'all') {
        const itemDate = new Date(item.date).getTime();
        const now = Date.now();
        const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
        if (filterDateRange === '7days' && daysDiff > 7) return false;
        if (filterDateRange === '30days' && daysDiff > 30) return false;
        if (filterDateRange === 'this_month') {
          const itemMonth = new Date(item.date).getMonth();
          const currentMonth = new Date().getMonth();
          if (itemMonth !== currentMonth) return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeGroupAllExpenses, filterCategory, filterMemberId, searchQuery, filterDateRange]);

  // Group Balances (Calculated from all expenses and settlements in base currency)
  const groupBalances = useMemo(() => {
    if (!activeGroup) return { memberStats: {}, groupTotalSpent: 0, baseCurrency: 'USD' };
    return calculateGroupBalances(
      activeGroup,
      activeGroupAllExpenses,
      activeGroupSettlements,
      currencyRates
    );
  }, [activeGroup, activeGroupAllExpenses, activeGroupSettlements, currencyRates]);

  // Simplified Debts (Greedy Min-Cash-Flow)
  const simplifiedDebts = useMemo(() => {
    if (!activeGroup || !groupBalances.memberStats) return [];
    return simplifyDebts(groupBalances.memberStats, activeGroup.currency || 'USD');
  }, [activeGroup, groupBalances]);

  // Direct Pairwise Debts (Full pairwise graph)
  const directPairwiseDebts = useMemo(() => {
    if (!activeGroup) return [];
    return calculateDirectPairwiseDebts(
      activeGroup,
      activeGroupAllExpenses,
      activeGroupSettlements,
      currencyRates
    );
  }, [activeGroup, activeGroupAllExpenses, activeGroupSettlements, currencyRates]);

  // Current User's Net Balance in Active Group
  const currentUserStats = useMemo(() => {
    if (!groupBalances.memberStats) return null;
    return groupBalances.memberStats[currentUser.id] || null;
  }, [groupBalances, currentUser.id]);

  // Action: Add Expense
  const addExpense = useCallback((expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    soundEffects.successExpense();
    addToast(`Expense "${newExpense.title}" added`, 'success');
  }, [addToast]);

  // Action: Update Expense
  const updateExpense = useCallback((expenseId, updates) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expenseId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
    addToast('Expense updated successfully', 'success');
  }, [addToast]);

  // Action: Delete Expense
  const deleteExpense = useCallback((expenseId) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    soundEffects.pop();
    addToast('Expense deleted', 'info');
  }, [addToast]);

  // Action: Record Settlement
  const recordSettlement = useCallback((settlementData) => {
    const newSettlement = {
      ...settlementData,
      id: `stl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: settlementData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setSettlements((prev) => [newSettlement, ...prev]);

    // Audio & Confetti Celebration!
    soundEffects.settleChime();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // Confetti fallback
    }

    // Set celebration modal data
    setCelebrationData(newSettlement);
    addToast('Settlement recorded! Balances updated.', 'success');
  }, [addToast]);

  // Action: Delete Settlement
  const deleteSettlement = useCallback((settlementId) => {
    setSettlements((prev) => prev.filter((s) => s.id !== settlementId));
    soundEffects.pop();
    addToast('Settlement record removed', 'info');
  }, [addToast]);

  // Action: Add Group
  const addGroup = useCallback((groupData) => {
    const newGroup = {
      ...groupData,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
    soundEffects.pop();
    addToast(`Group "${newGroup.name}" created!`, 'success');
  }, [addToast]);

  // Action: Update Group
  const updateGroup = useCallback((groupId, updates) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
    addToast('Group settings updated', 'success');
  }, [addToast]);

  // Action: Delete Group
  const deleteGroup = useCallback((groupId) => {
    if (groups.length <= 1) {
      addToast('Cannot delete the only remaining group', 'warning');
      return;
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setExpenses((prev) => prev.filter((e) => e.groupId !== groupId));
    setSettlements((prev) => prev.filter((s) => s.groupId !== groupId));

    const remaining = groups.filter((g) => g.id !== groupId);
    setActiveGroupId(remaining[0].id);
    addToast('Group deleted', 'info');
  }, [groups, addToast]);

  // Action: Add Member to Group
  const addMemberToGroup = useCallback((groupId, memberData) => {
    const memberId = memberData.id || `u-${Date.now()}`;
    const newMember = {
      id: memberId,
      name: memberData.name,
      email: memberData.email || '',
      avatar: memberData.avatar || '👤',
      color: memberData.color || '#3b82f6',
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            members: [...g.members, newMember],
          };
        }
        return g;
      })
    );
    soundEffects.pop();
    addToast(`Added ${newMember.name} to the group`, 'success');
  }, [addToast]);

  // Action: Switch Current User (simulate viewing as Sarah, Kenji, Elena, etc.)
  const switchCurrentUser = useCallback((memberId) => {
    if (!activeGroup) return;
    const targetMember = activeGroup.members.find((m) => m.id === memberId);
    if (targetMember) {
      const updatedUser = {
        id: targetMember.id,
        name: targetMember.name.replace(' (You)', ''),
        email: targetMember.email || `${targetMember.id}@example.com`,
        avatar: targetMember.avatar || '👤',
        color: targetMember.color || '#10b981',
        preferredCurrency: activeGroup.currency || 'USD',
      };
      setCurrentUser(updatedUser);
      soundEffects.pop();
      addToast(`Switched perspective to ${updatedUser.name}`, 'info');
    }
  }, [activeGroup, addToast]);

  // Action: Reset Demo Data
  const resetDemoData = useCallback(() => {
    setGroups(INITIAL_GROUPS);
    setExpenses(INITIAL_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
    setActiveGroupId(INITIAL_GROUPS[0].id);
    setCurrentUser(DEFAULT_USER);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_GROUP);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    soundEffects.pop();
    addToast('Reset to demo sample data successfully', 'success');
  }, [addToast]);

  // Action: Toggle Theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    soundEffects.pop();
  }, []);

  const value = {
    theme,
    toggleTheme,
    currentUser,
    setCurrentUser,
    switchCurrentUser,
    groups,
    activeGroupId,
    setActiveGroupId,
    activeGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    expenses,
    activeGroupAllExpenses,
    filteredExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    settlements,
    activeGroupSettlements,
    recordSettlement,
    deleteSettlement,
    currencyRates,
    ratesMeta,
    loadRates,
    groupBalances,
    simplifiedDebts,
    directPairwiseDebts,
    currentUserStats,
    activeTab,
    setActiveTab,
    settlementViewMode,
    setSettlementViewMode,
    expenseModalOpen,
    setExpenseModalOpen,
    editingExpense,
    setEditingExpense,
    settleModalOpen,
    setSettleModalOpen,
    settlePrefill,
    setSettlePrefill,
    createGroupModalOpen,
    setCreateGroupModalOpen,
    groupSettingsModalOpen,
    setGroupSettingsModalOpen,
    userProfileModalOpen,
    setUserProfileModalOpen,
    exportModalOpen,
    setExportModalOpen,
    celebrationData,
    setCelebrationData,
    filterCategory,
    setFilterCategory,
    filterDateRange,
    setFilterDateRange,
    filterMemberId,
    setFilterMemberId,
    searchQuery,
    setSearchQuery,
    resetDemoData,
    toasts,
    addToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
