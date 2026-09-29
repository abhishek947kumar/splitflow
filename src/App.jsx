import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { GroupHero } from './components/dashboard/GroupHero';
import { GroupTabs } from './components/dashboard/GroupTabs';
import { ExpenseList } from './components/expenses/ExpenseList';
import { SettlementView } from './components/settlements/SettlementView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettlementHistory } from './components/settlements/SettlementHistory';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { SettleModal } from './components/settlements/SettleModal';
import { ConfettiReceipt } from './components/settlements/ConfettiReceipt';
import { CreateGroupModal } from './components/groups/CreateGroupModal';
import { GroupSettingsModal } from './components/groups/GroupSettingsModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { ToastContainer } from './components/common/ToastContainer';

import './index.css';
import './styles/components.css';

function MainApp() {
  const { activeTab } = useApp();

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navbar */}
        <Navbar />

        {/* Hero Section: Personalized Net Balance & Group Totals */}
        <GroupHero />

        {/* View Switcher Tabs */}
        <GroupTabs />

        {/* Tab View Content */}
        <div style={{ marginTop: '16px' }}>
          {activeTab === 'expenses' && <ExpenseList />}
          {activeTab === 'settlements' && <SettlementView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'history' && <SettlementHistory />}
        </div>
      </main>

      {/* Modals & Dialogs */}
      <ExpenseModal />
      <SettleModal />
      <ConfettiReceipt />
      <CreateGroupModal />
      <GroupSettingsModal />
      <UserProfileModal />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Mobile Bottom Navigation & Action Bar */}
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
