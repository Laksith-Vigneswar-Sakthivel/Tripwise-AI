import React, { useMemo, useState } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatCurrency } from '../utils/formatters';
import { generateSavingsPlan } from '../services/aiFinanceService';
import {
  PiggyBank,
  Target,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Compass,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const SavingsPage = () => {
  const { user, updateUser, expenses, setActivePage } = useTripWise();

  const [customGoalInput, setCustomGoalInput] = useState(user.savingsTarget || 4000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const monthlyTarget = user.savingsTarget || 4000;
  const currentSaved = user.currentSaved || 2200;
  const remainingTarget = Math.max(0, monthlyTarget - currentSaved);
  const progressPercent = Math.min(100, Math.round((currentSaved / (monthlyTarget || 1)) * 100));

  const plan = useMemo(
    () => generateSavingsPlan(monthlyTarget, currentSaved, expenses),
    [monthlyTarget, currentSaved, expenses]
  );

  const handleSaveGoal = (e) => {
    e.preventDefault();
    updateUser({ savingsTarget: Number(customGoalInput) || 4000 });
    setIsEditingGoal(false);
  };

  const handleDepositQuick = (amount) => {
    updateUser({ currentSaved: currentSaved + amount });
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="SAVINGS INTELLIGENCE"
        title="Savings Goals & Milestones"
        subtitle="Automate your travel reserve and optimize weekly spending habits with AI recommendations."
        isAiPowered
        actions={
          <div className="header-button-group">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsEditingGoal(!isEditingGoal)}
            >
              <Sliders size={14} />
              <span>{isEditingGoal ? 'Cancel Edit' : 'Adjust Goal Target'}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleDepositQuick(500)}
            >
              <TrendingUp size={14} />
              <span>+ Deposit {formatCurrency(500, user.currency)}</span>
            </button>
          </div>
        }
      />

      {/* Adjust Goal Form (Expandable) */}
      {isEditingGoal && (
        <div className="adjust-goal-card">
          <form onSubmit={handleSaveGoal} className="adjust-goal-form">
            <div>
              <label className="form-label">Monthly Savings Target ({user.currency === 'INR' ? '₹' : '$'})</label>
              <p className="form-sublabel">Define your monthly liquidity target dedicated to upcoming travel & buffers.</p>
            </div>
            <div className="adjust-goal-inputs">
              <input
                type="number"
                min="500"
                step="500"
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                className="form-input font-mono"
              />
              <button type="submit" className="btn btn-primary">
                Save Target
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4 Summary Metrics */}
      <div className="metrics-grid">
        <MetricCard
          label="Monthly Target"
          value={formatCurrency(monthlyTarget, user.currency)}
          subtitle="Target for current month"
          icon={Target}
        />
        <MetricCard
          label="Amount Saved"
          value={formatCurrency(currentSaved, user.currency)}
          change={`${progressPercent}% completed`}
          positive={true}
          icon={PiggyBank}
        />
        <MetricCard
          label="Remaining Target"
          value={formatCurrency(remainingTarget, user.currency)}
          subtitle="To reach 100% goal"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Recommended Weekly Saving"
          value={formatCurrency(plan.recommendedWeeklySaving, user.currency)}
          subtitle="4-week paced cadence"
          icon={Zap}
        />
      </div>

      {/* Hero Savings Progress Card */}
      <div className="savings-hero-card">
        <div className="savings-hero-left">
          <div className="savings-progress-title-row">
            <div>
              <span className="savings-badge-pill">TARGET PACE: ON TRACK</span>
              <h2 className="savings-hero-heading">
                {formatCurrency(currentSaved, user.currency)} of {formatCurrency(monthlyTarget, user.currency)}
              </h2>
              <p className="savings-hero-sub">
                You have achieved <strong>{progressPercent}%</strong> of your savings objective this month.
                Only {formatCurrency(remainingTarget, user.currency)} required to complete the fund.
              </p>
            </div>
          </div>

          <div className="savings-progress-track-wrapper">
            <ProgressBar
              percent={progressPercent}
              height={14}
              variant={progressPercent >= 75 ? 'success' : 'primary'}
            />

            <div className="progress-markers-row">
              <span className="marker-point">₹0</span>
              <span className="marker-point">25% (₹{Math.round(monthlyTarget * 0.25).toLocaleString('en-IN')})</span>
              <span className="marker-point">50% (₹{Math.round(monthlyTarget * 0.5).toLocaleString('en-IN')})</span>
              <span className="marker-point">75% (₹{Math.round(monthlyTarget * 0.75).toLocaleString('en-IN')})</span>
              <span className="marker-point">100% (₹{monthlyTarget.toLocaleString('en-IN')})</span>
            </div>
          </div>

          <div className="savings-quick-add-pills">
            <span className="quick-add-label">Quick Allocate:</span>
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleDepositQuick(250)}
            >
              +₹250
            </button>
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleDepositQuick(500)}
            >
              +₹500
            </button>
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleDepositQuick(1000)}
            >
              +₹1,000
            </button>
          </div>
        </div>

        <div className="savings-hero-travel-tie">
          <div className="travel-tie-header">
            <Compass size={16} className="travel-tie-icon" />
            <span>LINKED TRAVEL FUND</span>
          </div>
          <h4 className="travel-tie-title">Goa Beach Getaway</h4>
          <p className="travel-tie-dates">October 2026 · ₹12,000 Budget</p>
          <div className="travel-tie-metric">
            <span className="tie-metric-lbl">Fund Contribution</span>
            <span className="tie-metric-val">
              {Math.min(100, Math.round((currentSaved / 12000) * 100))}%
            </span>
          </div>
          <ProgressBar
            percent={Math.min(100, Math.round((currentSaved / 12000) * 100))}
            height={6}
            variant="success"
          />
          <button
            type="button"
            className="btn btn-outline btn-sm btn-block mt-3"
            onClick={() => setActivePage('My Trips')}
          >
            <span>View All Trips</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* AI SAVINGS PLAN (Dynamic Recommendations) */}
      <div className="ai-savings-plan-section">
        <div className="ai-plan-banner">
          <div className="ai-banner-left">
            <div className="ai-pill">
              <Sparkles size={14} />
              <span>AI SAVINGS PLAN</span>
            </div>
            <h3 className="ai-plan-title">Smart Savings Levers & Optimization</h3>
            <p className="ai-plan-highlight">
              💡 {plan.dynamicInsight}
            </p>
          </div>

          <div className="ai-banner-right">
            <div className="weekly-target-box">
              <span className="wt-lbl">Recommended Weekly Saving</span>
              <span className="wt-val">
                {formatCurrency(plan.recommendedWeeklySaving, user.currency)}
              </span>
              <span className="wt-sub">Every Monday</span>
            </div>
          </div>
        </div>

        <div className="levers-grid">
          {plan.levers.map((lever, idx) => (
            <div key={idx} className="lever-card">
              <div className="lever-header">
                <span className="lever-badge">{lever.category}</span>
                <span className="lever-impact-tag">{lever.impact}</span>
              </div>
              <h4 className="lever-title">{lever.title}</h4>
              <p className="lever-desc">{lever.description}</p>
              <div className="lever-footer">
                <CheckCircle2 size={15} className="lever-check-icon" />
                <span className="lever-status">AI Recommended Action</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
