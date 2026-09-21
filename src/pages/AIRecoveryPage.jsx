import React, { useMemo, useState } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { BudgetComparisonBar } from '../components/charts/BudgetComparisonBar';
import { formatCurrency } from '../utils/formatters';
import { generateRecoveryPlan } from '../services/aiFinanceService';
import { calculateTripMetrics } from '../services/tripService';

import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Zap,
  Wallet,
  TrendingDown,
  CalendarDays,
} from 'lucide-react';

const RECOVERY_ICONS = {
  Food: Utensils,
  Transport: Car,
  Activities: Ticket,
  Shopping: ShoppingBag,
  Entertainment: Ticket,
  Travel: CalendarDays,
  Bills: Wallet,
  Healthcare: ShieldCheck,
  Education: ShieldCheck,
  Other: Wallet,
  'General Spending': Wallet,
};

export const AIRecoveryPage = () => {
  const [recoveryMode, setRecoveryMode] = useState('trip');
  const [monthlyAnalysisPlan, setMonthlyAnalysisPlan] = useState(null);

  const {
    trips,
    activeTripId,
    setActiveTripId,
    tripExpenses,
    applyRecoveryPlan,
    resetRecoveryPlan,
    user,
    setActivePage,

    // Monthly recovery
    generateMonthlyRecoveryPlan,
    monthlyRecoveryPlan,
    applyMonthlyRecoveryPlan,
    resetMonthlyRecoveryPlan,

    expenses,
  } = useTripWise();

  // ============================================================
  // SELECTED TRIP
  // ============================================================

  const selectedTrip = useMemo(() => {
    return (
      trips.find((t) => t.id === activeTripId) ||
      trips[0]
    );
  }, [trips, activeTripId]);

  // ============================================================
  // CURRENT TRIP EXPENSES
  // ============================================================

  const currentExpenses = useMemo(() => {
    if (!selectedTrip) return [];

    return tripExpenses[selectedTrip.id] || [];
  }, [selectedTrip, tripExpenses]);

  // ============================================================
  // CURRENT TRIP METRICS
  // ============================================================

  const metrics = useMemo(() => {
    if (!selectedTrip) {
      return {
        budget: 12000,
        projectedSpend: 13750,
      };
    }

    return calculateTripMetrics(
      selectedTrip,
      currentExpenses
    );
  }, [selectedTrip, currentExpenses]);

  // ============================================================
  // TRIP RECOVERY PLAN
  // ============================================================

  const tripRecoveryPlan = useMemo(() => {
    const budget = metrics.budget || 12000;
    const projected =
      metrics.projectedSpend || 13750;

    return generateRecoveryPlan(
      budget,
      projected,
      currentExpenses
    );
  }, [metrics, currentExpenses]);

  // ============================================================
  // TRIP RECOVERY STATE
  // ============================================================

  const tripIsApplied = Boolean(
    selectedTrip?.recoveryApplied
  );

  const displayedTripRecoveryPlan = tripIsApplied
    ? selectedTrip?.recoveryDetails || tripRecoveryPlan
    : tripRecoveryPlan;

  // ============================================================
  // MONTHLY RECOVERY PLAN
  // ============================================================

  const monthlyPlan = monthlyAnalysisPlan || monthlyRecoveryPlan;

  const monthlyIsOverBudget =
    monthlyPlan?.isOverBudget ?? false;

  const monthlyIsApplied =
    Boolean(monthlyPlan?.recoveryApplied);

  // ============================================================
  // MONTHLY RECOVERY GENERATION
  // ============================================================

  const handleGenerateMonthlyRecovery = () => {
    const budget =
      Number(user?.monthlyBudget) > 0
        ? Number(user.monthlyBudget)
        : 10000;

    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const dayOfMonth = Math.max(
      1,
      Math.min(now.getDate(), daysInMonth)
    );

    const totalSpent = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

    // Project the current spending pace to month-end.
    const projectedSpend =
      dayOfMonth > 0
        ? Math.round(
            (totalSpent / dayOfMonth) *
              daysInMonth
          )
        : totalSpent;

    const projectedPlan = generateRecoveryPlan(
      budget,
      projectedSpend,
      expenses
    );

    const remainingBudget = Math.max(
      0,
      budget - totalSpent
    );

    const weeklyAverage =
      dayOfMonth > 0
        ? Math.round(
            (totalSpent / dayOfMonth) * 7
          )
        : 0;

    const plan = {
      ...projectedPlan,
      type: 'monthly',
      monthlyBudget: budget,
      totalSpent,
      projectedSpend,
      projectedOverspend: Math.max(
        0,
        projectedSpend - budget
      ),
      remainingBudget,
      weeklyAverage,
      safeWeeklyLimit: Math.max(
        0,
        (budget - totalSpent) /
          Math.max(
            1,
            (daysInMonth - dayOfMonth) / 7
          )
      ),
      isOverBudget:
        projectedSpend > budget,
      summary:
        projectedSpend > budget
          ? `At your current spending pace, you are projected to spend ₹${projectedSpend.toLocaleString(
              'en-IN'
            )} this month, exceeding your ₹${budget.toLocaleString(
              'en-IN'
            )} budget by ₹${(
              projectedSpend - budget
            ).toLocaleString('en-IN')}.`
          : `At your current spending pace, you are projected to remain within your ₹${budget.toLocaleString(
              'en-IN'
            )} monthly budget.`,
    };

    setMonthlyAnalysisPlan(plan);

    // Keep the existing context state in sync.
    generateMonthlyRecoveryPlan();
  };

  // ============================================================
  // TRIP ACTIONS
  // ============================================================

  const handleTripApply = () => {
    if (selectedTrip && tripRecoveryPlan) {
      applyRecoveryPlan(
        selectedTrip.id,
        tripRecoveryPlan
      );
    }
  };

  const handleTripReset = () => {
    if (selectedTrip) {
      resetRecoveryPlan(selectedTrip.id);
    }
  };

  // ============================================================
  // MONTHLY ACTIONS
  // ============================================================

  const handleMonthlyApply = () => {
    if (monthlyPlan) {
      applyMonthlyRecoveryPlan(monthlyPlan);
    }
  };

  const handleMonthlyReset = () => {
    setMonthlyAnalysisPlan(null);
    resetMonthlyRecoveryPlan();
  };

  // ============================================================
  // MONTHLY LIVE NUMBERS
  // ============================================================

  const monthlyBudget =
    Number(user?.monthlyBudget) > 0
      ? Number(user.monthlyBudget)
      : 10000;

  const monthlySpent = useMemo(() => {
    return expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  const monthlyUsagePercent =
    monthlyBudget > 0
      ? Math.round(
          (monthlySpent / monthlyBudget) * 100
        )
      : 0;

  const now = new Date();

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  const dayOfMonth = Math.max(
    1,
    Math.min(now.getDate(), daysInMonth)
  );

  const liveProjectedSpend =
    dayOfMonth > 0
      ? Math.round(
          (monthlySpent / dayOfMonth) *
            daysInMonth
        )
      : monthlySpent;

  const liveProjectedOverspend = Math.max(
    0,
    liveProjectedSpend - monthlyBudget
  );

  const liveRemainingBudget = Math.max(
    0,
    monthlyBudget - monthlySpent
  );

  const liveWeeklyAverage =
    dayOfMonth > 0
      ? Math.round(
          (monthlySpent / dayOfMonth) * 7
        )
      : 0;

  const monthlyProjectedSpend =
    monthlyPlan?.projectedSpend ??
    liveProjectedSpend;

  const monthlyProjectedOverspend =
    monthlyPlan?.projectedOverspend ??
    liveProjectedOverspend;

  const monthlyRemainingBudget =
    monthlyPlan?.remainingBudget ??
    liveRemainingBudget;

  const monthlyWeeklyAverage =
    monthlyPlan?.weeklyAverage ??
    liveWeeklyAverage;

  const monthlySafeWeeklyLimit =
    monthlyPlan?.safeWeeklyLimit ??
    monthlyRemainingBudget;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="page-container">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <PageHeader
        eyebrow="INTELLIGENT INTERVENTION"
        title="AI Budget Recovery"
        subtitle={
          recoveryMode === 'trip'
            ? 'Detect projected trip overspending and rebalance flexible categories.'
            : 'Analyze your monthly spending and create a recovery plan when your budget is exceeded.'
        }
        isAiPowered
        actions={
          <div className="header-button-group">

            {/* MODE SELECTOR */}

            <div className="recovery-mode-toggle">

              <button
                type="button"
                className={
                  recoveryMode === 'trip'
                    ? 'recovery-mode-btn active'
                    : 'recovery-mode-btn'
                }
                onClick={() =>
                  setRecoveryMode('trip')
                }
              >
                <CalendarDays size={15} />
                Trip Recovery
              </button>

              <button
                type="button"
                className={
                  recoveryMode === 'monthly'
                    ? 'recovery-mode-btn active'
                    : 'recovery-mode-btn'
                }
                onClick={() =>
                  setRecoveryMode('monthly')
                }
              >
                <Wallet size={15} />
                Monthly Recovery
              </button>

            </div>

            {/* TRIP SELECTOR */}

            {recoveryMode === 'trip' && (
              <select
                value={selectedTrip?.id || ''}
                onChange={(e) =>
                  setActiveTripId(e.target.value)
                }
                className="filter-select font-semibold"
              >
                {trips.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                  >
                    {t.destination} ({t.status})
                  </option>
                ))}
              </select>
            )}

            {/* RESET */}

            {recoveryMode === 'trip' &&
              tripIsApplied && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleTripReset}
                >
                  <RotateCcw size={14} />
                  <span>Reset Demo State</span>
                </button>
              )}

            {recoveryMode === 'monthly' &&
              monthlyIsApplied && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleMonthlyReset}
                >
                  <RotateCcw size={14} />
                  <span>Reset Recovery</span>
                </button>
              )}

          </div>
        }
      />

      {/* ======================================================
          ======================================================
          TRIP RECOVERY MODE
          ======================================================
          ====================================================== */}

      {recoveryMode === 'trip' && (
        <>
          {/* APPLIED RECOVERY */}

          {tripIsApplied && (
            <div className="recovery-success-banner">

              <div className="success-banner-left">

                <CheckCircle2
                  size={24}
                  className="success-banner-icon"
                />

                <div>

                  <h3 className="success-banner-title">
                    Recovery Plan Active
                  </h3>

                  <p className="success-banner-desc">
                    Category reductions totaling{' '}

                    <strong>
                      {formatCurrency(
                        displayedTripRecoveryPlan.totalRecovery,
                        user.currency
                      )}
                    </strong>{' '}

                    have been applied. Your new projected
                    spend is locked at{' '}

                    <strong>
                      {formatCurrency(
                        displayedTripRecoveryPlan.newProjectedSpend,
                        user.currency
                      )}
                    </strong>.
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setActivePage('Trip Spending')
                }
              >
                <span>View Trip Spending</span>
                <ArrowRight size={14} />
              </button>

            </div>
          )}

          {/* PROJECTED OVERSPENDING */}

          {!tripIsApplied && (
            <div className="recovery-hero-banner">

              <div className="recovery-hero-left">

                <div className="ai-pill-danger">
                  <AlertTriangle size={14} />
                  <span>
                    PROJECTED OVERSPENDING
                  </span>
                </div>

                <h2 className="recovery-hero-title">
                  +
                  {formatCurrency(
                    displayedTripRecoveryPlan.overspendAmount,
                    user.currency
                  )}
                </h2>

                <p className="recovery-hero-sub">

                  Without intervention,{' '}

                  <strong>
                    {selectedTrip?.destination}
                  </strong>{' '}

                  will exceed its budget by{' '}

                  {formatCurrency(
                    displayedTripRecoveryPlan.overspendAmount,
                    user.currency
                  )}.

                  {' '}TripWise AI has generated a
                  deterministic category reduction plan.

                </p>

              </div>

              <div className="recovery-hero-cta">

                <button
                  type="button"
                  className="btn btn-ai-recovery btn-lg"
                  onClick={handleTripApply}
                >
                  <Sparkles size={18} />

                  <span>
                    Apply AI Recovery Plan
                  </span>

                  <ArrowRight size={18} />
                </button>

                <span className="cta-guarantee-text">
                  100% Deterministic Financial Arithmetic
                </span>

              </div>

            </div>
          )}

          {/* FINANCIAL MODEL */}

          <div className="recovery-section-wrapper">

            <div className="section-label-row">

              <span className="section-label">
                FINANCIAL REBALANCING MODEL
              </span>

              <span className="section-sub">
                Before vs. Recommended Adjustments vs. Target
              </span>

            </div>

            <BudgetComparisonBar
              budget={
                displayedTripRecoveryPlan.tripBudget
              }
              projected={
                displayedTripRecoveryPlan.projectedSpend
              }
              recovered={
                displayedTripRecoveryPlan.newProjectedSpend
              }
              recoveryAmount={
                displayedTripRecoveryPlan.totalRecovery
              }
              currency={user.currency}
            />

          </div>

          {/* CATEGORY REDUCTIONS */}

          <div className="recovery-levers-section">

            <div className="section-header-compact">

              <div>

                <h3 className="section-heading">
                  Category Reduction Allocations
                </h3>

                <p className="section-subheading">
                  Cuts are weighted dynamically across
                  flexible categories to protect lodging
                  & essentials.
                </p>

              </div>

              <span className="total-cuts-badge">
                Total Recovery:{' '}
                {formatCurrency(
                  displayedTripRecoveryPlan.totalRecovery,
                  user.currency
                )}
              </span>

            </div>

            <div className="levers-grid">

              {displayedTripRecoveryPlan.recoveryCuts?.map(
                (cut) => {

                  const Icon =
                    RECOVERY_ICONS[cut.category] ||
                    Utensils;

                  return (
                    <div
                      key={cut.category}
                      className="recovery-cut-card"
                    >

                      <div className="cut-card-top">

                        <div className="cut-cat-info">

                          <div className="cut-cat-icon">
                            <Icon size={18} />
                          </div>

                          <div>

                            <h4 className="cut-cat-name">
                              {cut.category}
                            </h4>

                            <span className="cut-cat-tag">
                              Discretionary
                            </span>

                          </div>

                        </div>

                        <div className="cut-amount-badge">

                          <span className="cut-sign">
                            Reduce spending by
                          </span>

                          <strong className="cut-val">
                            {formatCurrency(
                              cut.cutAmount,
                              user.currency
                            )}
                          </strong>

                        </div>

                      </div>

                      <div className="cut-card-body">

                        <p className="cut-action-text">
                          {cut.action}
                        </p>

                        <div className="cut-tip-box">

                          <Zap
                            size={13}
                            className="tip-zap"
                          />

                          <span>
                            <strong>
                              Pro-Tip:
                            </strong>{' '}
                            {cut.tip}
                          </span>

                        </div>

                      </div>

                      <div className="cut-card-footer">

                        <span className="cut-status">

                          <ShieldCheck
                            size={14}
                            className="cut-shield"
                          />

                          <span>
                            Deterministic Allocation
                          </span>

                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* TRIP RATIONALE */}

          <div className="ai-explanation-card">

            <div className="explanation-header">

              <Sparkles
                size={16}
                className="explanation-icon"
              />

              <h4>
                TripWise AI Strategic Rationale
              </h4>

            </div>

            <p className="explanation-text">

              "{displayedTripRecoveryPlan.summary}

              {' '}Lodging (Stay) costs are protected to
              avoid compromising hotel bookings.

              {' '}Reductions are focused entirely on
              flexible lifestyle components—dining,
              private cabs, premium excursions, and
              retail shopping."

            </p>

          </div>
        </>
      )}

      {/* ======================================================
          ======================================================
          MONTHLY RECOVERY MODE
          ======================================================
          ====================================================== */}

      {recoveryMode === 'monthly' && (
        <>
          {/* MONTHLY SUMMARY */}

          <div className="recovery-hero-banner">

            <div className="recovery-hero-left">

              <div
                className={
                  monthlyProjectedOverspend > 0
                    ? 'ai-pill-danger'
                    : 'ai-pill-success'
                }
              >
                {monthlyProjectedOverspend > 0? (
                  <AlertTriangle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}

                <span>
                  {monthlyProjectedOverspend > 0
  ? 'PROJECTED OVER BUDGET'
  : 'MONTHLY BUDGET ON TRACK'}
                </span>
              </div>

              <h2 className="recovery-hero-title">
  {formatCurrency(
    monthlyProjectedOverspend,
    user.currency
  )}
</h2>

              <p className="recovery-hero-sub">
  You have spent{' '}
  <strong>
    {formatCurrency(
      monthlySpent,
      user.currency
    )}
  </strong>{' '}
  of your{' '}
  <strong>
    {formatCurrency(
      monthlyBudget,
      user.currency
    )}
  </strong>{' '}
  monthly budget.

  {' '}Your current pace is approximately{' '}
  <strong>
    {formatCurrency(
      monthlyWeeklyAverage,
      user.currency
    )}
  </strong>{' '}
  per week.

  {monthlyProjectedOverspend > 0 && (
    <>
      {' '}At this pace, you're projected to reach{' '}
      <strong>
        {formatCurrency(
          monthlyProjectedSpend,
          user.currency
        )}
      </strong>{' '}
      by month-end, exceeding your budget by{' '}
      <strong>
        {formatCurrency(
          monthlyProjectedOverspend,
          user.currency
        )}
      </strong>.
    </>
  )}
</p>

            </div>

            <div className="recovery-hero-cta">

              {!monthlyPlan && (
                <button
                  type="button"
                  className="btn btn-ai-recovery btn-lg"
                  onClick={handleGenerateMonthlyRecovery}
                >
                  <Sparkles size={18} />

                  <span>
                    Generate Monthly Recovery
                  </span>

                  <ArrowRight size={18} />
                </button>
              )}

              {monthlyPlan &&
                !monthlyIsApplied &&
                monthlyIsOverBudget && (
                  <button
                    type="button"
                    className="btn btn-ai-recovery btn-lg"
                    onClick={handleMonthlyApply}
                  >
                    <Sparkles size={18} />

                    <span>
                      Apply Monthly Recovery
                    </span>

                    <ArrowRight size={18} />
                  </button>
                )}

              {monthlyPlan &&
                !monthlyIsOverBudget && (
                  <button
                    type="button"
                    className="btn btn-outline btn-lg"
                    onClick={handleGenerateMonthlyRecovery}
                  >
                    <Sparkles size={18} />
                    <span>Refresh Analysis</span>
                  </button>
                )}

            </div>

          </div>

          {/* MONTHLY FINANCIAL MODEL */}

          {monthlyPlan && monthlyIsOverBudget && (
            <div className="recovery-section-wrapper">

              <div className="section-label-row">

                <span className="section-label">
                  MONTHLY FINANCIAL REBALANCING
                </span>

                <span className="section-sub">
                  Budget vs. Current Spending vs. Recovery Target
                </span>

              </div>

              <BudgetComparisonBar
  budget={
    monthlyPlan.monthlyBudget
  }
  projected={
    monthlyPlan.projectedSpend
  }
  recovered={
    monthlyPlan.newProjectedSpend
  }
  recoveryAmount={
    monthlyPlan.totalRecovery
  }
  currency={user.currency}
/>

            </div>
          )}

          {/* MONTHLY SUCCESS */}

          {monthlyIsApplied && (
            <div className="recovery-success-banner">

              <div className="success-banner-left">

                <CheckCircle2
                  size={24}
                  className="success-banner-icon"
                />

                <div>

                  <h3 className="success-banner-title">
                    Monthly Recovery Plan Active
                  </h3>

                  <p className="success-banner-desc">

                    AI has identified{' '}

                    <strong>
                      {formatCurrency(
                        monthlyPlan.totalRecovery,
                        user.currency
                      )}
                    </strong>{' '}

                    in potential spending reductions.

                    The recovery target is{' '}

                    <strong>
                      {formatCurrency(
                        monthlyPlan.newProjectedSpend,
                        user.currency
                      )}
                    </strong>.

                  </p>

                </div>

              </div>

            </div>
          )}

          {/* MONTHLY REDUCTION CARDS */}

          {monthlyPlan?.recoveryCuts?.length > 0 && (
            <div className="recovery-levers-section">

              <div className="section-header-compact">

                <div>

                  <h3 className="section-heading">
                    Monthly Reduction Allocations
                  </h3>

                  <p className="section-subheading">
                    AI prioritizes discretionary spending
                    before essential categories.
                  </p>

                </div>

                <span className="total-cuts-badge">
                  Total Recovery:{' '}
                  {formatCurrency(
                    monthlyPlan.totalRecovery,
                    user.currency
                  )}
                </span>

              </div>

              <div className="levers-grid">

                {monthlyPlan.recoveryCuts.map(
                  (cut) => {

                    const Icon =
                      RECOVERY_ICONS[cut.category] ||
                      Wallet;

                    return (
                      <div
                        key={cut.category}
                        className="recovery-cut-card"
                      >

                        <div className="cut-card-top">

                          <div className="cut-cat-info">

                            <div className="cut-cat-icon">
                              <Icon size={18} />
                            </div>

                            <div>

                              <h4 className="cut-cat-name">
                                {cut.category}
                              </h4>

                              <span className="cut-cat-tag">
                                {cut.category === 'Healthcare' ||
                                cut.category === 'Education' ||
                                cut.category === 'Bills'
                                  ? 'Essential'
                                  : 'Flexible'}
                              </span>

                            </div>

                          </div>

                          <div className="cut-amount-badge">

                            <span className="cut-sign">
                              Reduce spending by
                            </span>

                            <strong className="cut-val">
                              {formatCurrency(
                                cut.cutAmount,
                                user.currency
                              )}
                            </strong>

                          </div>

                        </div>

                        <div className="cut-card-body">

                          <p className="cut-action-text">
                            {cut.action}
                          </p>

                          <div className="cut-tip-box">

                            <Zap
                              size={13}
                              className="tip-zap"
                            />

                            <span>
                              <strong>
                                Pro-Tip:
                              </strong>{' '}
                              {cut.tip}
                            </span>

                          </div>

                        </div>

                        <div className="cut-card-footer">

                          <span className="cut-status">

                            <TrendingDown
                              size={14}
                              className="cut-shield"
                            />

                            <span>
                              Monthly Allocation
                            </span>

                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* WITHIN BUDGET MESSAGE */}

          {monthlyPlan &&
            !monthlyPlan.isOverBudget && (
              <div className="ai-explanation-card">

                <div className="explanation-header">

                  <CheckCircle2
                    size={16}
                    className="explanation-icon"
                  />

                  <h4>
                    Monthly Budget Is Under Control
                  </h4>

                </div>

                <p className="explanation-text">
                  {monthlyPlan.summary}
                  {' '}No recovery cuts are required right now.
                  TripWise AI will continue using your current
                  monthly budget and expense data for future
                  analysis.
                </p>

              </div>
            )}

          {/* MONTHLY RATIONALE */}

          {monthlyPlan?.isOverBudget && (
            <div className="ai-explanation-card">

              <div className="explanation-header">

                <Sparkles
                  size={16}
                  className="explanation-icon"
                />

                <h4>
                  TripWise AI Monthly Strategic Rationale
                </h4>

              </div>

              <p className="explanation-text">
                "{monthlyPlan.summary}"
                {' '}The recovery engine prioritizes
                discretionary categories first while
                attempting to protect essential spending.
                The target is calculated using deterministic
                financial arithmetic from your recorded
                monthly expenses.
              </p>

            </div>
          )}

        </>
      )}

    </div>
  );
};