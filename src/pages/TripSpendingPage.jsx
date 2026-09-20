import React, { useState, useMemo } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateTripMetrics, TRIP_CATEGORIES } from '../services/tripService';
import {
  Coins,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Building,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Stay: Building,
  Food: Utensils,
  Transport: Car,
  Activities: Ticket,
  Shopping: ShoppingBag,
  Other: HelpCircle,
};

export const TripSpendingPage = () => {
  const {
    trips,
    activeTripId,
    setActiveTripId,
    tripExpenses,
    addTripExpense,
    deleteTripExpense,
    user,
    setActivePage,
  } = useTripWise();

  // Selected trip
  const selectedTrip = useMemo(() => {
    return trips.find((t) => t.id === activeTripId) || trips[0] || null;
  }, [trips, activeTripId]);

  const currentExpenses = useMemo(() => {
    if (!selectedTrip) return [];
    return tripExpenses[selectedTrip.id] || [];
  }, [selectedTrip, tripExpenses]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!selectedTrip) {
      return {
        budget: 12000,
        spent: 8600,
        remaining: 3400,
        progressPercent: 72,
        projectedSpend: 13750,
        isOverBudget: true,
        overspendAmount: 1750,
        categoryBreakdown: {},
      };
    }
    return calculateTripMetrics(selectedTrip, currentExpenses);
  }, [selectedTrip, currentExpenses]);

  // Form state for adding trip expense
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.merchant.trim() || !formData.amount || !selectedTrip) return;

    addTripExpense(selectedTrip.id, {
      ...formData,
      amount: Number(formData.amount),
    });

    setFormData({
      merchant: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowAddForm(false);
  };

  if (!selectedTrip) {
    return (
      <div className="page-container">
        <div className="empty-state-view">
          <Coins size={40} className="empty-state-icon" />
          <h3>No active trip found</h3>
          <p>Create or select a trip from My Trips to track your vacation spending.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActivePage('Trip Planner')}
          >
            Plan a Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="ON-TRIP LEDGER"
        title="Trip Spending Tracker"
        subtitle={`Real-time expenses and run-rate monitoring for ${selectedTrip.destination}.`}
        actions={
          <div className="header-button-group">
            {/* Trip Selector Dropdown */}
            <div className="trip-select-wrap">
              <select
                value={selectedTrip.id}
                onChange={(e) => setActiveTripId(e.target.value)}
                className="filter-select font-semibold"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.destination} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={15} />
              <span>{showAddForm ? 'Close Form' : 'Log Trip Expense'}</span>
            </button>
          </div>
        }
      />

      {/* 4 Primary Trip Metrics (Section 15) */}
      <div className="metrics-grid">
        <MetricCard
          label="Trip Budget"
          value={formatCurrency(metrics.budget, user.currency)}
          subtitle={`${selectedTrip.days} Days · ${selectedTrip.travelers} Travelers`}
          icon={Wallet}
        />
        <MetricCard
          label="Spent So Far"
          value={formatCurrency(metrics.spent, user.currency)}
          change={`${metrics.progressPercent}% utilized`}
          positive={metrics.progressPercent <= 80}
          icon={Coins}
        />
        <MetricCard
          label="Remaining"
          value={formatCurrency(metrics.remaining, user.currency)}
          change={metrics.remaining >= 0 ? 'Available balance' : 'Deficit'}
          positive={metrics.remaining >= 0}
          icon={ShieldCheck}
        />
        <MetricCard
          label="Projected Spend"
          value={formatCurrency(metrics.projectedSpend, user.currency)}
          change={
            metrics.isOverBudget
              ? `+${formatCurrency(metrics.overspendAmount, user.currency)} over budget`
              : 'Within budget'
          }
          positive={!metrics.isOverBudget}
          icon={TrendingUp}
        />
      </div>

      {/* OVERSPENDING DETECTION ALERT (Section 16) */}
      {metrics.isOverBudget && (
        <div className="overspending-alert-banner">
          <div className="alert-left-content">
            <div className="alert-icon-circle">
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="alert-badge-tag">OVERSPENDING DETECTED</div>
              <h3 className="alert-title">
                Projected to exceed budget by {formatCurrency(metrics.overspendAmount, user.currency)}
              </h3>
              <p className="alert-desc">
                Current burn-rate projects total trip expenses at{' '}
                <strong>{formatCurrency(metrics.projectedSpend, user.currency)}</strong> against your{' '}
                <strong>{formatCurrency(metrics.budget, user.currency)}</strong> cap. TripWise AI has formulated a targeted category recovery plan.
              </p>
            </div>
          </div>

          <div className="alert-right-action">
            <button
              type="button"
              className="btn btn-ai-recovery btn-lg"
              onClick={() => setActivePage('AI Recovery')}
            >
              <Sparkles size={16} />
              <span>Launch AI Recovery Plan</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar Visualization */}
      <div className="trip-progress-card">
        <div className="progress-card-header">
          <span className="card-lbl">BUDGET EXHAUSTION TIMELINE</span>
          <span className="card-val font-mono">
            {metrics.progressPercent}% of {formatCurrency(metrics.budget, user.currency)}
          </span>
        </div>

        <ProgressBar
          percent={metrics.progressPercent}
          height={12}
          variant={metrics.isOverBudget ? 'danger' : 'primary'}
        />

        <div className="progress-legend-row">
          <span>₹0</span>
          <span>50%</span>
          <span>Budget: {formatCurrency(metrics.budget, user.currency)}</span>
          {metrics.isOverBudget && (
            <span className="danger-text">
              Projected: {formatCurrency(metrics.projectedSpend, user.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Add Trip Expense Inline Form */}
      {showAddForm && (
        <div className="inline-add-expense-card">
          <div className="inline-card-header">
            <h4>Log Expense for {selectedTrip.destination}</h4>
            <span className="text-muted">Recorded into this trip's specific ledger</span>
          </div>

          <form onSubmit={handleSubmit} className="inline-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="te-merchant">
                Merchant / Expense Title
              </label>
              <input
                id="te-merchant"
                type="text"
                required
                placeholder="e.g. Thalassa Restaurant, Cab to Fort"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="te-amount">
                Amount ({user.currency === 'INR' ? '₹' : '$'})
              </label>
              <input
                id="te-amount"
                type="number"
                min="1"
                step="any"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="form-input font-mono"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="te-category">
                Trip Category
              </label>
              <select
                id="te-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
              >
                {TRIP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="te-date">
                Date
              </label>
              <input
                id="te-date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="te-notes">
                Notes (Optional)
              </label>
              <input
                id="te-notes"
                type="text"
                placeholder="e.g. Sunset drinks with friends"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="inline-form-actions full-width">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save to Trip Ledger
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Breakdown Chips */}
      <div className="trip-category-chips-grid">
        {TRIP_CATEGORIES.map((cat) => {
          const amt = metrics.categoryBreakdown[cat] || 0;
          const Icon = CATEGORY_ICONS[cat] || HelpCircle;

          return (
            <div key={cat} className="trip-cat-chip-card">
              <div className="cat-chip-header">
                <Icon size={16} className="cat-chip-icon" />
                <span className="cat-chip-title">{cat}</span>
              </div>
              <div className="cat-chip-amount">{formatCurrency(amt, user.currency)}</div>
              <div className="cat-chip-sub">
                {metrics.spent > 0 ? `${Math.round((amt / metrics.spent) * 100)}% of spent` : '0%'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trip Expenses Table */}
      <div className="expenses-table-card">
        <div className="table-card-header">
          <div>
            <h4 className="table-title">{selectedTrip.destination} Expense Ledger</h4>
            <span className="table-subtitle">{currentExpenses.length} transactions logged</span>
          </div>
        </div>

        {currentExpenses.length === 0 ? (
          <div className="empty-state-view">
            <Receipt size={32} className="empty-state-icon" />
            <p>No transactions logged for this trip yet.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAddForm(true)}
            >
              Log First Trip Expense
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Merchant / Activity</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((e) => (
                  <tr key={e.id} className="data-table-row">
                    <td className="font-semibold">{e.merchant}</td>
                    <td>
                      <span className={`cat-pill cat-pill-${(e.category || 'other').toLowerCase()}`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="text-muted-cell">{formatDate(e.date)}</td>
                    <td className="text-muted-cell">{e.notes || '—'}</td>
                    <td className="text-right font-mono font-semibold">
                      {formatCurrency(e.amount, user.currency)}
                    </td>
                    <td className="text-center actions-col">
                      <button
                        type="button"
                        className="table-action-btn btn-danger-icon"
                        title="Delete expense"
                        onClick={() => deleteTripExpense(selectedTrip.id, e.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
