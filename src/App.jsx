import React from 'react';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import {
  TripWiseProvider,
  useTripWise,
} from './context/TripWiseContext';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { SavingsPage } from './pages/SavingsPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { TripSpendingPage } from './pages/TripSpendingPage';
import { AIRecoveryPage } from './pages/AIRecoveryPage';
import { InsightsPage } from './pages/InsightsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SettingsPage } from './pages/SettingsPage';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Modals
import { AddExpenseModal } from './components/modals/AddExpenseModal';

const PageRenderer = () => {
  const { activePage } = useTripWise();

  switch (activePage) {
    case 'Overview':
      return <OverviewPage />;

    case 'Expenses':
      return <ExpensesPage />;

    case 'Savings':
      return <SavingsPage />;

    case 'My Trips':
      return <MyTripsPage />;

    case 'Trip Planner':
      return <TripPlannerPage />;

    case 'Trip Spending':
      return <TripSpendingPage />;

    case 'AI Recovery':
      return <AIRecoveryPage />;

    case 'Insights':
      return <InsightsPage />;

    case 'Simulator':
      return <SimulatorPage />;

    case 'Settings':
      return <SettingsPage />;

    default:
      return <OverviewPage />;
  }
};

const MainLayout = () => {
  const { darkMode } = useTripWise();

  return (
    <div
      className={
        darkMode
          ? 'app-shell dark-theme'
          : 'app-shell light-theme'
      }
    >
      <Sidebar />

      <div className="app-main">
        <TopBar />

        <main className="main-content">
          <PageRenderer />
        </main>

        {/* Global Add Expense Modal */}
        <AddExpenseModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Authenticator>
      {({ user }) => (
        <TripWiseProvider authUser={user}>
          <MainLayout />
        </TripWiseProvider>
      )}
    </Authenticator>
  );
}