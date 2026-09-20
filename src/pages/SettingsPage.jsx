import React, { useState } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import {
  User,
  Sun,
  Moon,
  Sparkles,
  Coins,
  Database,
  RotateCcw,
  Download,
  Save,
} from 'lucide-react';

export const SettingsPage = () => {
  const {
    user,
    updateUser,
    darkMode,
    toggleTheme,
    resetDemoData,
    expenses,
    trips,
    tripExpenses,
  } = useTripWise();

  const [formData, setFormData] = useState({
    name: user.name || 'Laksith',
    email: user.email || 'laksith@tripwise.ai',
    monthlyBudget: user.monthlyBudget || 10000,
    savingsTarget: user.savingsTarget || 4000,
    currency: user.currency || 'INR',
    aiInsightsEnabled: user.aiInsightsEnabled !== false,
    budgetAlertThreshold: user.budgetAlertThreshold || 80,
    tripMonitoring: user.tripMonitoring !== false,
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(formData);
  };

  const handleExportJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      user: { ...user, ...formData },
      expenses,
      trips,
      tripExpenses,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tripwise-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="SYSTEM CONFIGURATION"
        title="Settings & Preferences"
        subtitle="Manage personal thresholds, AI automation toggles, currency standards, and data backup."
      />

      <div className="settings-stack">
        {/* Profile Section */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-left">
              <User size={18} className="settings-icon" />
              <div>
                <h3 className="settings-title">User Profile & Budget Baseline</h3>
                <p className="settings-sub">Personal identity and global monthly financial limits.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="user-name">
                  Full Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="user-email">
                  Email Address
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="user-budget">
                  Monthly Spending Budget ({formData.currency})
                </label>
                <input
                  id="user-budget"
                  type="number"
                  min="1000"
                  step="500"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: Number(e.target.value) })}
                  className="form-input font-mono"
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="user-savings">
                  Monthly Savings Target ({formData.currency})
                </label>
                <input
                  id="user-savings"
                  type="number"
                  min="500"
                  step="500"
                  value={formData.savingsTarget}
                  onChange={(e) => setFormData({ ...formData, savingsTarget: Number(e.target.value) })}
                  className="form-input font-mono"
                />
              </div>
            </div>

            <div className="form-actions-right">
              <button type="submit" className="btn btn-primary">
                <Save size={15} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </section>

        {/* Appearance & Theme Section */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-left">
              {darkMode ? <Moon size={18} className="settings-icon" /> : <Sun size={18} className="settings-icon" />}
              <div>
                <h3 className="settings-title">Appearance & Interface Theme</h3>
                <p className="settings-sub">Switch between dark navy foundation and clean light mode.</p>
              </div>
            </div>
          </div>

          <div className="theme-toggle-selector">
            <button
              type="button"
              className={`theme-option-btn ${darkMode ? 'active' : ''}`}
              onClick={() => !darkMode && toggleTheme()}
            >
              <div className="theme-preview dark-preview">
                <div className="preview-nav" />
                <div className="preview-cards">
                  <div className="p-card" />
                  <div className="p-card" />
                </div>
              </div>
              <div className="theme-meta">
                <Moon size={16} />
                <span className="theme-name">Dark Navy Foundation</span>
                <span className="theme-tag">Default Hackathon Mode</span>
              </div>
            </button>

            <button
              type="button"
              className={`theme-option-btn ${!darkMode ? 'active' : ''}`}
              onClick={() => darkMode && toggleTheme()}
            >
              <div className="theme-preview light-preview">
                <div className="preview-nav" />
                <div className="preview-cards">
                  <div className="p-card" />
                  <div className="p-card" />
                </div>
              </div>
              <div className="theme-meta">
                <Sun size={16} />
                <span className="theme-name">Muted Cream / Light</span>
                <span className="theme-tag">High Contrast Daytime</span>
              </div>
            </button>
          </div>
        </section>

        {/* AI & Automation Intelligence */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-left">
              <Sparkles size={18} className="settings-icon text-primary" />
              <div>
                <h3 className="settings-title">AI Automation & Anomaly Detection</h3>
                <p className="settings-sub">Configure how aggressively TripWise monitors your burn rates.</p>
              </div>
            </div>
          </div>

          <div className="settings-toggle-list">
            <div className="settings-toggle-row">
              <div className="toggle-info">
                <span className="toggle-title">AI Financial Brief Synthesis</span>
                <span className="toggle-desc">Generate natural-language daily briefs analyzing food and discretionary trends.</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.aiInsightsEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setFormData({ ...formData, aiInsightsEnabled: val });
                    updateUser({ aiInsightsEnabled: val });
                  }}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="settings-toggle-row">
              <div className="toggle-info">
                <span className="toggle-title">Predictive Trip Overspending Guard</span>
                <span className="toggle-desc">Automatically compute run-rate projections and alert when vacation expenses risk breach.</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.tripMonitoring}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setFormData({ ...formData, tripMonitoring: val });
                    updateUser({ tripMonitoring: val });
                  }}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        </section>

        {/* Currency & Thresholds */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-left">
              <Coins size={18} className="settings-icon" />
              <div>
                <h3 className="settings-title">Currency & Alert Thresholds</h3>
                <p className="settings-sub">Localization standards and notification sensitivities.</p>
              </div>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="settings-currency">
                  Operating Currency
                </label>
                <select
                  id="settings-currency"
                  value={formData.currency}
                  onChange={(e) => {
                    const c = e.target.value;
                    setFormData({ ...formData, currency: c });
                    updateUser({ currency: c });
                  }}
                  className="form-select"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="settings-alert-thresh">
                  Early Warning Trigger Threshold
                </label>
                <select
                  id="settings-alert-thresh"
                  value={formData.budgetAlertThreshold}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setFormData({ ...formData, budgetAlertThreshold: t });
                    updateUser({ budgetAlertThreshold: t });
                  }}
                  className="form-select"
                >
                  <option value={70}>70% of Budget utilized</option>
                  <option value={80}>80% of Budget utilized (Recommended)</option>
                  <option value={90}>90% of Budget utilized</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-left">
              <Database size={18} className="settings-icon" />
              <div>
                <h3 className="settings-title">Data Storage & Recovery</h3>
                <p className="settings-sub">Backup your records or restore hackathon demo scenario state.</p>
              </div>
            </div>
          </div>

          <div className="data-actions-row">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleExportJson}
            >
              <Download size={15} />
              <span>Export All Data (JSON)</span>
            </button>

            <button
              type="button"
              className="btn btn-danger-soft"
              onClick={() => {
                if (window.confirm('Reset all transactions, trips, and demo state back to default hackathon seed data?')) {
                  resetDemoData();
                  setFormData({
                    name: 'Laksith',
                    email: 'laksith@tripwise.ai',
                    monthlyBudget: 10000,
                    savingsTarget: 4000,
                    currency: 'INR',
                    aiInsightsEnabled: true,
                    budgetAlertThreshold: 80,
                    tripMonitoring: true,
                  });
                }
              }}
            >
              <RotateCcw size={15} />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
