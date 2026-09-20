import React, { useState, useMemo } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { formatCurrency } from '../utils/formatters';
import { simulatePurchase } from '../services/aiFinanceService';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Compass,
} from 'lucide-react';

const PRESET_PURCHASES = [
  { label: 'AirPods / Headphones', amount: 2000, category: 'Shopping' },
  { label: 'Weekend Getaway Stay', amount: 4500, category: 'Travel' },
  { label: 'Fine Dining Celebration', amount: 1500, category: 'Food' },
  { label: 'New Smartwatch', amount: 8200, category: 'Shopping' },
];

export const SimulatorPage = () => {
  const { expenses, user, trips } = useTripWise();

  const [amount, setAmount] = useState(2000);
  const [description, setDescription] = useState('Noise Cancelling Headphones');
  const [category, setCategory] = useState('Shopping');

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const upcomingTrip = useMemo(
    () => trips.find((t) => t.status === 'Upcoming' || t.status === 'Active') || { destination: 'Goa', budget: 12000 },
    [trips]
  );

  const simulation = useMemo(() => {
    return simulatePurchase(
      amount,
      category,
      totalSpent,
      user.monthlyBudget || 10000,
      user.savingsTarget || 4000,
      upcomingTrip
    );
  }, [amount, category, totalSpent, user, upcomingTrip]);

  const handleSelectPreset = (preset) => {
    setAmount(preset.amount);
    setDescription(preset.label);
    setCategory(preset.category);
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="PREDICTIVE SIMULATION"
        title="Can I afford this?"
        subtitle="Test impulse buys or unplanned expenses against your monthly budget and upcoming travel savings before swiping."
        isAiPowered
      />

      <div className="simulator-grid-layout">
        {/* Left: Input Card */}
        <div className="sim-input-card">
          <div className="sim-card-header">
            <Calculator size={18} className="sim-icon" />
            <h3 className="sim-title">Purchase Simulation</h3>
          </div>

          <div className="form-stack">
            {/* Presets */}
            <div className="sim-presets-row">
              <span className="presets-label">Quick Scenarios:</span>
              <div className="presets-chips">
                {PRESET_PURCHASES.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className={`preset-chip ${amount === p.amount ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    {p.label} ({formatCurrency(p.amount, user.currency)})
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sim-desc">
                Item / Purchase Description
              </label>
              <input
                id="sim-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Concert tickets, New jacket"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="sim-amount">
                  Purchase Amount ({user.currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  id="sim-amount"
                  type="number"
                  min="50"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="form-input font-mono font-bold text-lg"
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="sim-category">
                  Category
                </label>
                <select
                  id="sim-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="Shopping">Shopping</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Travel">Travel & Lodging</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Live Financial Context Bar */}
            <div className="sim-context-box">
              <div className="sim-context-item">
                <span className="ctx-lbl">Current Spent</span>
                <span className="ctx-val font-mono">{formatCurrency(totalSpent, user.currency)}</span>
              </div>
              <div className="ctx-sep">+</div>
              <div className="sim-context-item">
                <span className="ctx-lbl">This Purchase</span>
                <span className="ctx-val font-mono text-primary">{formatCurrency(amount, user.currency)}</span>
              </div>
              <div className="ctx-sep">=</div>
              <div className="sim-context-item">
                <span className="ctx-lbl">New Projected</span>
                <span className="ctx-val font-mono font-bold">{formatCurrency(simulation.projectedMonthlySpend, user.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Decision Support Verdict Card */}
        <div className="sim-result-card">
          <div className="verdict-banner">
            <div className="verdict-header">
              <span className="verdict-tag">AI VERDICT</span>
              <div className={`verdict-badge badge-${simulation.verdictClass}`}>
                {simulation.verdictClass === 'positive' && <CheckCircle2 size={16} />}
                {simulation.verdictClass === 'warning' && <AlertTriangle size={16} />}
                {simulation.verdictClass === 'danger' && <XCircle size={16} />}
                <span>{simulation.verdict}</span>
              </div>
            </div>

            <p className="verdict-headline">
              "{simulation.rationale}"
            </p>
          </div>

          {/* Detailed Ledger Projection Breakdown */}
          <div className="sim-ledger-breakdown">
            <h4 className="breakdown-title">Post-Purchase Ledger State</h4>

            <div className="breakdown-row">
              <span className="bk-lbl">Monthly Budget Cap</span>
              <span className="bk-val font-mono">{formatCurrency(simulation.monthlyBudget, user.currency)}</span>
            </div>

            <div className="breakdown-row">
              <span className="bk-lbl">Current Month Outflow</span>
              <span className="bk-val font-mono">{formatCurrency(simulation.currentSpent, user.currency)}</span>
            </div>

            <div className="breakdown-row highlight-row">
              <span className="bk-lbl">Simulated Purchase: {description}</span>
              <span className="bk-val font-mono font-bold">+{formatCurrency(simulation.purchaseAmount, user.currency)}</span>
            </div>

            <div className="breakdown-divider" />

            <div className="breakdown-row total-row">
              <span className="bk-lbl">Projected Spending</span>
              <span className="bk-val font-mono font-bold">{formatCurrency(simulation.projectedMonthlySpend, user.currency)}</span>
            </div>

            <div className="breakdown-row">
              <span className="bk-lbl">Remaining Headroom</span>
              <span className={`bk-val font-mono ${simulation.remainingBudget >= 0 ? 'text-success' : 'danger-text'}`}>
                {simulation.remainingBudget >= 0
                  ? formatCurrency(simulation.remainingBudget, user.currency)
                  : `-${formatCurrency(Math.abs(simulation.remainingBudget), user.currency)}`}
              </span>
            </div>
          </div>

          {/* Travel Impact Insight */}
          <div className="travel-impact-box">
            <div className="travel-impact-header">
              <Compass size={15} className="travel-impact-icon" />
              <span>Travel Goal Protection Assessment</span>
            </div>
            <p className="travel-impact-text">
              Target destination: <strong>{upcomingTrip.destination}</strong> (Fund budget: {formatCurrency(upcomingTrip.budget, user.currency)}).
              {simulation.verdictClass === 'danger'
                ? ' Warning: This purchase completely overrides your monthly savings capability and will force a delay in your travel timeline.'
                : simulation.verdictClass === 'warning'
                ? ' Attention: You will need to make micro-cuts in dining over the next 2 weeks to keep your travel savings target intact.'
                : ' Fully safe: This purchase does not compromise your scheduled contributions to your travel fund.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
