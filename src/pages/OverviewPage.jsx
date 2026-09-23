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

  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning';
  }

  if (hour < 15) {
    return 'Good Afternoon';
  }

  return 'Good Evening';
};
  // ============================================================
  // FINANCIAL SUMMARY
  // ============================================================

  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [expenses]
  );

  const monthlyBudget =
    Number(user?.monthlyBudget) > 0
      ? Number(user.monthlyBudget)
      : 10000;

  const savingsTarget =
    Number(user?.savingsTarget) > 0
      ? Number(user.savingsTarget)
      : 4000;

  const remainingBudget = Math.max(
    0,
    monthlyBudget - totalSpent
  );

  // ============================================================
  // AI FINANCIAL BRIEF
  // ============================================================

  const aiBrief = useMemo(
    () =>
      analyzeSpending(
        expenses,
        monthlyBudget,
        savingsTarget
      ),
    [expenses, monthlyBudget, savingsTarget]
  );

  // ============================================================
  // DYNAMIC BUDGET HEALTH
  //
  // <= 70%       Healthy
  // > 70% - 80%  Moderate
  // > 80% - 100% Warning
  // > 100% -120% Over Budget
  // > 120%       Critical
  // ============================================================

  const budgetUsagePercent =
    monthlyBudget > 0
      ? Math.round(
          (totalSpent / monthlyBudget) * 100
        )
      : 0;

  const budgetHealth =
    budgetUsagePercent > 120
      ? 'Critical'
      : budgetUsagePercent > 100
      ? 'Over Budget'
      : budgetUsagePercent > 80
      ? 'Warning'
      : budgetUsagePercent > 70
      ? 'Moderate'
      : 'Healthy';

  const budgetHealthLevel =
    budgetUsagePercent > 120
      ? 'critical'
      : budgetUsagePercent > 100
      ? 'over-budget'
      : budgetUsagePercent > 80
      ? 'warning'
      : budgetUsagePercent > 70
      ? 'moderate'
      : 'healthy';

  const budgetOverage = Math.max(
    0,
    totalSpent - monthlyBudget
  );

  const budgetHealthChange =
    budgetUsagePercent > 100
      ? `${budgetUsagePercent}% used · Over budget`
      : budgetUsagePercent > 80
      ? `${budgetUsagePercent}% used · High risk`
      : `${budgetUsagePercent}% used`;

  // ============================================================
  // CATEGORY BREAKDOWN
  // ============================================================

  const categoryData = useMemo(() => {
    const categories = [
      'Food',
      'Shopping',
      'Transport',
      'Entertainment',
      'Bills',
      'Other',
    ];

    return categories
      .map((cat) => {
        const val = expenses
          .filter((expense) => {
            if (cat === 'Other') {
              return ![
                'Food',
                'Shopping',
                'Transport',
                'Entertainment',
                'Bills',
              ].includes(expense.category);
            }

            return expense.category === cat;
          })
          .reduce(
            (sum, expense) =>
              sum + Number(expense.amount || 0),
            0
          );

        return {
          label: cat,
          value: val,
        };
      })
      .filter((item) => item.value > 0);
  }, [expenses]);

  // ============================================================
  // FEATURED TRIP
  // ============================================================

  const featuredTrip = useMemo(() => {
    return (
      trips.find((trip) => trip.status === 'Active') ||
      trips.find((trip) => trip.status === 'Upcoming') ||
      trips[0]
    );
  }, [trips]);

  // ============================================================
  // RECENT TRANSACTIONS
  // ============================================================

  const recentTransactions = useMemo(() => {
    return [...expenses].slice(0, 5);
  }, [expenses]);

  // ============================================================
  // TRIP CARD NAVIGATION
  // ============================================================

  const handleTripCardClick = () => {
    if (!featuredTrip) return;

    setActiveTripId(featuredTrip.id);

    if (featuredTrip.status === 'Active') {
      setActivePage('Trip Spending');
    } else {
      setActivePage('My Trips');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="page-container">

      {/* ========================================================
          PAGE HEADER
          ======================================================== */}

      <PageHeader
        eyebrow="FINANCIAL OVERVIEW"
        title={`${getGreeting()}, ${user.name || 'Laksith'}.`}
        subtitle="Here's how your money is moving this month."
        isAiPowered
        actions={
          <div className="header-button-group">

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() =>
                setActivePage('Simulator')
              }
            >
              <span>Can I Afford This?</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() =>
                setIsAddExpenseModalOpen(true)
              }
            >
              <Plus size={15} />
              <span>Add Expense</span>
            </button>

          </div>
        }
      />

      {/* ========================================================
          PRIMARY METRIC CARDS
          ======================================================== */}

      <div
        className={`metrics-grid budget-health-${budgetHealthLevel}`}
      >

        {/* TOTAL SPENT */}

        <MetricCard
          label="Total Spent"
          value={formatCurrency(
            totalSpent,
            user.currency
          )}
          change="+8.4% this month"
          positive={false}
          icon={Wallet}
        />

        {/* SAVINGS TARGET */}

        <MetricCard
          label="Savings Target"
          value={formatCurrency(
            savingsTarget,
            user.currency
          )}
          change="This month"
          positive={true}
          icon={PiggyBank}
        />

        {/* REMAINING BUDGET */}

        <MetricCard
          label="Remaining Budget"
          value={formatCurrency(
            remainingBudget,
            user.currency
          )}
          change={`of ${formatCurrency(
            monthlyBudget,
            user.currency
          )}`}
          positive={remainingBudget > 0}
          icon={Activity}
        />

        {/* ======================================================
            BUDGET HEALTH
            ====================================================== */}

        <MetricCard
          label="Budget Health"
          value={budgetHealth}
          change={budgetHealthChange}
          positive={
            budgetHealth === 'Healthy' ||
            budgetHealth === 'Moderate'
          }
          icon={
            budgetHealth === 'Warning' ||
            budgetHealth === 'Over Budget' ||
            budgetHealth === 'Critical'
              ? AlertTriangle
              : Compass
          }
        />

      </div>

      {/* ========================================================
          BUDGET ALERT MESSAGE
          Only appears when spending is above 80%
          ======================================================== */}

      {budgetUsagePercent > 80 && (
        <div
          className={`budget-health-alert budget-alert-${budgetHealthLevel}`}
        >
          <div className="budget-alert-icon">
            <AlertTriangle size={18} />
          </div>

          <div className="budget-alert-content">
            <strong>
              {budgetHealth === 'Critical'
                ? 'Critical spending alert'
                : budgetHealth === 'Over Budget'
                ? 'Monthly budget exceeded'
                : 'High spending warning'}
            </strong>

            <span>
              You have used{' '}
              <strong>
                {budgetUsagePercent}%
              </strong>{' '}
              of your monthly budget
              {budgetOverage > 0
                ? ` and are ${formatCurrency(
                    budgetOverage,
                    user.currency
                  )} over budget.`
                : '.'}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          UPCOMING TRIP CARD
          ======================================================== */}

      {featuredTrip && (
        <div
          className="upcoming-trip-card"
          onClick={handleTripCardClick}
        >

          <div className="trip-card-image-wrap">

            <img
              src={
                featuredTrip.image ||
                featuredTrip.coverImage
              }
              alt={featuredTrip.destination}
              className="trip-banner-img"
              loading="lazy"
            />

            <div className="trip-banner-scrim" />

          </div>

          <div className="trip-card-content">

            <div className="trip-badge-row">

              <span className="trip-tag-pill">
                UPCOMING TRIP
              </span>

              {featuredTrip.projectedSpendOverride &&
                featuredTrip.projectedSpendOverride >
                  featuredTrip.budget && (
                  <span className="trip-warning-pill">
                    <AlertTriangle size={12} />
                    Overspending Risk Detected
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
                    {featuredTrip.days} Days ·{' '}
                    {featuredTrip.monthYear ||
                      'October 2026'}{' '}
                    ·{' '}
                    {featuredTrip.travelers || 2}{' '}
                    Travelers
                  </span>

                </p>

              </div>

              <div className="trip-budget-col">

                <span className="trip-budget-label">
                  Trip Budget
                </span>

                <span className="trip-budget-val">
                  {formatCurrency(
                    featuredTrip.budget,
                    user.currency
                  )}
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

      {/* ========================================================
          AI FINANCIAL BRIEF
          ======================================================== */}

      <div className="ai-brief-card">

        <div className="ai-brief-header">

          <div className="ai-brief-badge">

            <Sparkles
              size={14}
              className="ai-sparkle-anim"
            />

            <span>
              AI FINANCIAL BRIEF
            </span>

          </div>

          <span className="ai-brief-timestamp">
            Live Synthesis
          </span>

        </div>

        <div className="ai-brief-body">

          <p className="ai-brief-text">
            {aiBrief.narrative}
          </p>

          <div className="ai-brief-pills">

            <div className="brief-pill">
              <span className="pill-dot dot-green" />
              <span>
                Pace:{' '}
                <strong>
                  {aiBrief.savingsPace}
                </strong>
              </span>
            </div>

            <div className="brief-pill">
              <span className="pill-dot dot-blue" />
              <span>
                Top Category:{' '}
                <strong>
                  {aiBrief.topCategory} (
                  {formatCurrency(
                    aiBrief.topCategorySpent,
                    user.currency
                  )}
                  )
                </strong>
              </span>
            </div>

            <div className="brief-pill">
              <span className="pill-dot dot-amber" />
              <span>
                Suggested Cut:{' '}
                <strong>
                  ₹400/wk discretionary
                </strong>
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          TWO COLUMN DASHBOARD
          ======================================================== */}

      <div className="dashboard-two-col-grid">

        {/* ======================================================
            LEFT: SPENDING ANALYTICS
            ====================================================== */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                SPENDING ANALYTICS
              </span>

              <h3 className="panel-title">
                Category & Trend Pulse
              </h3>

            </div>

            <span className="panel-period-badge">
              This Month
            </span>

          </div>

          <div className="panel-body">

            <div className="analytics-split">

              {/* DONUT CHART */}

              <div className="donut-section">

                <DonutChart
                  data={categoryData}
                  currency={user.currency}
                  size={190}
                  centerTitle="Spent"
                />

              </div>

              {/* MONTHLY SPENDING TREND */}

              <div className="trend-section">

                <div className="trend-title-row">

                  <span className="trend-label">
                    Monthly Spending Pace
                  </span>

                  <span className="trend-val">
                    {formatCurrency(
                      totalSpent,
                      user.currency
                    )}
                  </span>

                </div>

                <SpendingBarChart
                  data={[
                    {
                      label: 'Week 1',
                      spent: 650,
                      budget: 2500,
                    },
                    {
                      label: 'Week 2',
                      spent: 804,
                      budget: 2500,
                    },
                    {
                      label: 'Week 3',
                      spent: 905,
                      budget: 2500,
                    },
                    {
                      label: 'Week 4',
                      spent: 0,
                      budget: 2500,
                    },
                  ]}
                  currency={user.currency}
                  height={150}
                />

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            RIGHT: RECENT TRANSACTIONS
            ====================================================== */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                LEDGER
              </span>

              <h3 className="panel-title">
                Recent Transactions
              </h3>

            </div>

            <button
              type="button"
              className="btn-text-link"
              onClick={() =>
                setActivePage('Expenses')
              }
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="panel-body">

            <div className="transaction-list">

              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="transaction-row"
                  >

                    <div className="tx-left">

                      <div className="tx-avatar">
                        {tx.merchant
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <div className="tx-merchant">
                          {tx.merchant}
                        </div>

                        <div className="tx-meta">

                          <span className="tx-category">
                            {tx.category}
                          </span>

                          <span className="tx-bullet">
                            ·
                          </span>

                          <span className="tx-date">
                            {tx.date}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="tx-right">

                      <div className="tx-amount">
                        -
                        {formatCurrency(
                          tx.amount,
                          user.currency
                        )}
                      </div>

                    </div>

                  </div>
                ))
              ) : (
                <div className="empty-state-view">
                  <Wallet size={28} />
                  <p>
                    No transactions yet.
                  </p>
                </div>
              )}

            </div>

            <div className="panel-footer-actions">

              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() =>
                  setIsAddExpenseModalOpen(true)
                }
              >
                <Plus size={15} />
                <span>
                  Add New Expense
                </span>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};