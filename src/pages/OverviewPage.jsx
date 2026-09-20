import React, { useMemo } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { DonutChart } from '../components/charts/DonutChart';
import { SpendingBarChart } from '../components/charts/SpendingBarChart';
import { formatCurrency } from '../utils/formatters';
import { analyzeSpending } from '../services/aiFinanceService';
import {
  Wallet,
  PiggyBank,
  Compass,
  Activity,
  Sparkles,
  ArrowRight,
  Plus,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export const OverviewPage = () => {
  const {
    user,
    expenses,
    trips,
    setActivePage,
    setIsAddExpenseModalOpen,
    setActiveTripId,
  } = useTripWise();

  // Financial summary calculations
  const totalSpent = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const monthlyBudget = user.monthlyBudget || 10000;
  const savingsTarget = user.savingsTarget || 4000;
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);

  const aiBrief = useMemo(
    () => analyzeSpending(expenses, monthlyBudget, savingsTarget),
    [expenses, monthlyBudget, savingsTarget]
  );

  const budgetHealth =
    totalSpent <= monthlyBudget * 0.7
      ? 'Healthy'
      : totalSpent <= monthlyBudget
      ? 'Moderate'
      : 'At Risk';

  // Category breakdown for Donut Chart
  const categoryData = useMemo(() => {
    const categories = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Other'];
    return categories
      .map((cat) => {
        const val = expenses
          .filter((e) => (cat === 'Other' ? !['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills'].includes(e.category) : e.category === cat))
          .reduce((s, e) => s + Number(e.amount || 0), 0);
        return { label: cat, value: val };
      })
      .filter((item) => item.value > 0);
  }, [expenses]);

  // Featured upcoming / active trip
  const featuredTrip = useMemo(() => {
    return (
      trips.find((t) => t.status === 'Active') ||
      trips.find((t) => t.status === 'Upcoming') ||
      trips[0]
    );
  }, [trips]);

  const recentTransactions = useMemo(() => {
    return [...expenses].slice(0, 5);
  }, [expenses]);

  const handleTripCardClick = () => {
    if (featuredTrip) {
      setActiveTripId(featuredTrip.id);
      if (featuredTrip.status === 'Active') {
        setActivePage('Trip Spending');
      } else {
        setActivePage('My Trips');
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="FINANCIAL OVERVIEW"
        title={`Good morning, ${user.name || 'Laksith'}.`}
        subtitle="Here's how your money is moving this month."
        isAiPowered
        actions={
          <div className="header-button-group">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setActivePage('Simulator')}
            >
              <span>Can I Afford This?</span>
              <ArrowUpRight size={14} />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddExpenseModalOpen(true)}
            >
              <Plus size={15} />
              <span>Add Expense</span>
            </button>
          </div>
        }
      />

      {/* 4 Primary Metric Cards */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Spent"
          value={formatCurrency(totalSpent, user.currency)}
          change="+8.4% this month"
          positive={false}
          icon={Wallet}
        />
        <MetricCard
          label="Savings Target"
          value={formatCurrency(savingsTarget, user.currency)}
          change="This month"
          positive={true}
          icon={PiggyBank}
        />
        <MetricCard
          label="Remaining Budget"
          value={formatCurrency(remainingBudget, user.currency)}
          change={`of ${formatCurrency(monthlyBudget, user.currency)}`}
          positive={true}
          icon={Activity}
        />
        <MetricCard
          label="Budget Health"
          value={budgetHealth}
          change="AI Monitored"
          positive={budgetHealth === 'Healthy'}
          icon={Compass}
        />
      </div>

      {/* Upcoming Trip Card Banner */}
      {featuredTrip && (
        <div className="upcoming-trip-card" onClick={handleTripCardClick}>
          <div className="trip-card-image-wrap">
            <img
              src={featuredTrip.image || featuredTrip.coverImage}
              alt={featuredTrip.destination}
              className="trip-banner-img"
              loading="lazy"
            />
            <div className="trip-banner-scrim" />
          </div>

          <div className="trip-card-content">
            <div className="trip-badge-row">
              <span className="trip-tag-pill">UPCOMING TRIP</span>
              {featuredTrip.projectedSpendOverride && featuredTrip.projectedSpendOverride > featuredTrip.budget && (
                <span className="trip-warning-pill">
                  <AlertTriangle size={12} /> Overspending Risk Detected
                </span>
              )}
            </div>

            <div className="trip-details-row">
              <div>
                <h3 className="trip-destination-title">
                  {featuredTrip.destination}
                </h3>
                <p className="trip-meta-subtitle">
                  <Calendar size={13} />
                  <span>
                    {featuredTrip.days} Days · {featuredTrip.monthYear || 'October 2026'} · {featuredTrip.travelers || 2} Travelers
                  </span>
                </p>
              </div>

              <div className="trip-budget-col">
                <span className="trip-budget-label">Trip Budget</span>
                <span className="trip-budget-val">
                  {formatCurrency(featuredTrip.budget, user.currency)}
                </span>
                <span className="trip-view-link">
                  <span>Manage Trip</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Financial Brief Card */}
      <div className="ai-brief-card">
        <div className="ai-brief-header">
          <div className="ai-brief-badge">
            <Sparkles size={14} className="ai-sparkle-anim" />
            <span>AI FINANCIAL BRIEF</span>
          </div>
          <span className="ai-brief-timestamp">Live Synthesis</span>
        </div>

        <div className="ai-brief-body">
          <p className="ai-brief-text">
            {aiBrief.narrative}
          </p>

          <div className="ai-brief-pills">
            <div className="brief-pill">
              <span className="pill-dot dot-green" />
              <span>Pace: <strong>{aiBrief.savingsPace}</strong></span>
            </div>
            <div className="brief-pill">
              <span className="pill-dot dot-blue" />
              <span>Top Category: <strong>{aiBrief.topCategory} ({formatCurrency(aiBrief.topCategorySpent, user.currency)})</strong></span>
            </div>
            <div className="brief-pill">
              <span className="pill-dot dot-amber" />
              <span>Suggested Cut: <strong>₹400/wk discretionary</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Dashboard Grid: Spending Analytics + Recent Transactions */}
      <div className="dashboard-two-col-grid">
        {/* Left: Spending Analytics Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">SPENDING ANALYTICS</span>
              <h3 className="panel-title">Category & Trend Pulse</h3>
            </div>
            <span className="panel-period-badge">This Month</span>
          </div>

          <div className="panel-body">
            <div className="analytics-split">
              {/* Donut Chart */}
              <div className="donut-section">
                <DonutChart
                  data={categoryData}
                  currency={user.currency}
                  size={190}
                  centerTitle="Spent"
                />
              </div>

              {/* Monthly Spending Trend Bar Chart */}
              <div className="trend-section">
                <div className="trend-title-row">
                  <span className="trend-label">Monthly Spending Pace</span>
                  <span className="trend-val">{formatCurrency(totalSpent, user.currency)}</span>
                </div>
                <SpendingBarChart
                  data={[
                    { label: 'Week 1', spent: 650, budget: 2500 },
                    { label: 'Week 2', spent: 804, budget: 2500 },
                    { label: 'Week 3', spent: 905, budget: 2500 },
                    { label: 'Week 4', spent: 0, budget: 2500 },
                  ]}
                  currency={user.currency}
                  height={150}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Transactions Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">LEDGER</span>
              <h3 className="panel-title">Recent Transactions</h3>
            </div>
            <button
              type="button"
              className="btn-text-link"
              onClick={() => setActivePage('Expenses')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="panel-body">
            <div className="transaction-list">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="transaction-row">
                  <div className="tx-left">
                    <div className="tx-avatar">
                      {tx.merchant.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="tx-merchant">{tx.merchant}</div>
                      <div className="tx-meta">
                        <span className="tx-category">{tx.category}</span>
                        <span className="tx-bullet">·</span>
                        <span className="tx-date">{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="tx-right">
                    <div className="tx-amount">
                      -{formatCurrency(tx.amount, user.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-footer-actions">
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setIsAddExpenseModalOpen(true)}
              >
                <Plus size={15} />
                <span>Add New Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
