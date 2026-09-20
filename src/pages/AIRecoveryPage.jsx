import React, { useMemo } from 'react';
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
} from 'lucide-react';

const RECOVERY_ICONS = {
  Food: Utensils,
  Transport: Car,
  Activities: Ticket,
  Shopping: ShoppingBag,
};

export const AIRecoveryPage = () => {
  const {
    trips,
    activeTripId,
    setActiveTripId,
    tripExpenses,
    applyRecoveryPlan,
    resetRecoveryPlan,
    user,
    setActivePage,
  } = useTripWise();

  // ------------------------------------------------------------
  // SELECTED TRIP
  // ------------------------------------------------------------

  const selectedTrip = useMemo(() => {
    return (
      trips.find((t) => t.id === activeTripId) ||
      trips[0]
    );
  }, [trips, activeTripId]);

  // ------------------------------------------------------------
  // CURRENT TRIP EXPENSES
  // ------------------------------------------------------------

  const currentExpenses = useMemo(() => {
    if (!selectedTrip) return [];

    return tripExpenses[selectedTrip.id] || [];
  }, [selectedTrip, tripExpenses]);

  // ------------------------------------------------------------
  // CURRENT TRIP METRICS
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // GENERATE CURRENT RECOVERY PLAN
  //
  // Before the plan is applied, this generates the live plan.
  // After application, we DO NOT use this recalculated plan
  // because the projected spend has already been overridden.
  // ------------------------------------------------------------

  const recoveryPlan = useMemo(() => {
    const budget = metrics.budget || 12000;
    const projected =
      metrics.projectedSpend || 13750;

    return generateRecoveryPlan(
      budget,
      projected,
      currentExpenses
    );
  }, [metrics, currentExpenses]);

  // ------------------------------------------------------------
  // RECOVERY STATE
  // ------------------------------------------------------------

  const isApplied = Boolean(
    selectedTrip?.recoveryApplied
  );

  /*
   * IMPORTANT:
   *
   * When the recovery plan is applied, TripWiseContext stores
   * the ORIGINAL recovery plan inside:
   *
   * selectedTrip.recoveryDetails
   *
   * We must use that saved plan after application.
   *
   * Otherwise calculateTripMetrics() sees ₹12,000 and generates
   * a NEW recovery plan with ₹0 recovery.
   */

  const displayedRecoveryPlan = isApplied
    ? selectedTrip?.recoveryDetails || recoveryPlan
    : recoveryPlan;

  // ------------------------------------------------------------
  // APPLY RECOVERY PLAN
  // ------------------------------------------------------------

  const handleApply = () => {
    if (selectedTrip && recoveryPlan) {
      applyRecoveryPlan(
        selectedTrip.id,
        recoveryPlan
      );
    }
  };

  // ------------------------------------------------------------
  // RESET RECOVERY PLAN
  // ------------------------------------------------------------

  const handleReset = () => {
    if (selectedTrip) {
      resetRecoveryPlan(selectedTrip.id);
    }
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="page-container">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <PageHeader
        eyebrow="INTELLIGENT INTERVENTION"
        title="AI Budget Recovery"
        subtitle="Detect projected overspending and rebalance remaining categories with actionable cuts."
        isAiPowered
        actions={
          <div className="header-button-group">

            {/* Trip Selector */}
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

            {/* Reset Button */}
            {isApplied && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleReset}
              >
                <RotateCcw size={14} />
                <span>Reset Demo State</span>
              </button>
            )}

          </div>
        }
      />

      {/* ======================================================
          APPLIED RECOVERY SUCCESS BANNER
          ====================================================== */}

      {isApplied && (
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
                    displayedRecoveryPlan.totalRecovery,
                    user.currency
                  )}
                </strong>{' '}

                have been applied. Your new projected
                spend is locked at{' '}

                <strong>
                  {formatCurrency(
                    displayedRecoveryPlan.newProjectedSpend,
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

      {/* ======================================================
          PROJECTED OVERSPENDING ALERT
          ====================================================== */}

      {!isApplied && (
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
                recoveryPlan.overspendAmount,
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
                recoveryPlan.overspendAmount,
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
              onClick={handleApply}
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

      {/* ======================================================
          FINANCIAL REBALANCING MODEL
          ====================================================== */}

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
            displayedRecoveryPlan.tripBudget
          }
          projected={
            displayedRecoveryPlan.projectedSpend
          }
          recovered={
            displayedRecoveryPlan.newProjectedSpend
          }
          recoveryAmount={
            displayedRecoveryPlan.totalRecovery
          }
          currency={user.currency}
        />

      </div>

      {/* ======================================================
          CATEGORY REDUCTION LEVERS
          ====================================================== */}

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
            Total Recovery: -

            {formatCurrency(
              displayedRecoveryPlan.totalRecovery,
              user.currency
            )}
          </span>

        </div>

        <div className="levers-grid">

          {displayedRecoveryPlan.recoveryCuts.map(
            (cut) => {

              const Icon =
                RECOVERY_ICONS[cut.category] ||
                Utensils;

              return (
                <div
                  key={cut.category}
                  className="recovery-cut-card"
                >

                  {/* Card Header */}
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

                  {/* Card Body */}
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

                  {/* Card Footer */}
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

      {/* ======================================================
          AI STRATEGIC RATIONALE
          ====================================================== */}

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

          "{displayedRecoveryPlan.summary}

          {' '}Lodging (Stay) costs are protected to
          avoid compromising hotel bookings.

          {' '}Reductions are focused entirely on
          flexible lifestyle components—dining,
          private cabs, premium excursions, and
          retail shopping."

        </p>

      </div>

    </div>
  );
};