import React from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, ArrowLeftRight, PieChart, History } from 'lucide-react';

export function GroupTabs() {
  const {
    activeTab,
    setActiveTab,
    filteredExpenses,
    simplifiedDebts,
    activeGroupSettlements,
  } = useApp();

  const tabs = [
    {
      id: 'expenses',
      label: 'Expenses Feed',
      icon: Receipt,
      count: filteredExpenses.length,
    },
    {
      id: 'settlements',
      label: 'Who Owes Whom',
      icon: ArrowLeftRight,
      count: simplifiedDebts.length,
      countColor: simplifiedDebts.length > 0 ? 'var(--negative)' : undefined,
    },
    {
      id: 'analytics',
      label: 'Spending Breakdown',
      icon: PieChart,
    },
    {
      id: 'history',
      label: 'Settlement Log',
      icon: History,
      count: activeGroupSettlements.length,
    },
  ];

  return (
    <div className="tabs-header">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className="tab-badge"
                style={tab.countColor && !isActive ? { color: tab.countColor, borderColor: tab.countColor } : {}}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
