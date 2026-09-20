import React, { useState, useMemo } from 'react';
import { useTripWise } from '../../context/TripWiseContext';
import { Modal } from './Modal';
import {
  Search,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Compass,
  MapPin,
  Coins,
  Sparkles,
  BarChart3,
  Calculator,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const PAGES = [
  { id: 'Overview', label: 'Overview Dashboard', icon: LayoutDashboard, category: 'Main' },
  { id: 'Expenses', label: 'Expense Ledger & CSV', icon: Receipt, category: 'Main' },
  { id: 'Savings', label: 'AI Savings Goals', icon: PiggyBank, category: 'Main' },
  { id: 'My Trips', label: 'My Trips Portfolio', icon: Compass, category: 'Travel' },
  { id: 'Trip Planner', label: 'Trip Budget Planner', icon: MapPin, category: 'Travel' },
  { id: 'Trip Spending', label: 'Trip Spending Tracker', icon: Coins, category: 'Travel' },
  { id: 'AI Recovery', label: 'AI Overspending Recovery', icon: Sparkles, category: 'Intelligence' },
  { id: 'Insights', label: 'Financial Insights', icon: BarChart3, category: 'Intelligence' },
  { id: 'Simulator', label: 'Can I Afford This? Simulator', icon: Calculator, category: 'Intelligence' },
  { id: 'Settings', label: 'Preferences & System', icon: Settings, category: 'System' },
];

export const QuickSearchModal = () => {
  const {
    isQuickSearchOpen,
    setIsQuickSearchOpen,
    setActivePage,
    expenses,
    user,
    setIsAddExpenseModalOpen,
  } = useTripWise();

  const [query, setQuery] = useState('');

  const filteredPages = useMemo(() => {
    if (!query) return PAGES;
    const q = query.toLowerCase();
    return PAGES.filter((p) => p.label.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [query]);

  const filteredExpenses = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return expenses
      .filter((e) => e.merchant.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
      .slice(0, 4);
  }, [query, expenses]);

  const handleSelectPage = (pageId) => {
    setActivePage(pageId);
    setIsQuickSearchOpen(false);
    setQuery('');
  };

  const handleAddExpenseAction = () => {
    setIsQuickSearchOpen(false);
    setIsAddExpenseModalOpen(true);
  };

  return (
    <Modal
      isOpen={isQuickSearchOpen}
      onClose={() => setIsQuickSearchOpen(false)}
      maxWidth="580px"
      className="quick-search-modal"
    >
      <div className="search-input-wrap">
        <Search className="search-input-icon" size={20} />
        <input
          type="text"
          placeholder="Search pages, transactions, or type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-palette-input"
          autoFocus
        />
      </div>

      <div className="search-results-list">
        {/* Quick Actions */}
        {!query && (
          <div className="search-section">
            <div className="search-section-title">QUICK ACTIONS</div>
            <div className="search-result-item" onClick={handleAddExpenseAction}>
              <div className="search-item-left">
                <Receipt size={16} className="search-item-icon" />
                <span>Add new expense transaction</span>
              </div>
              <ArrowRight size={14} className="search-item-arrow" />
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="search-section">
          <div className="search-section-title">PAGES & MODULES</div>
          {filteredPages.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="search-result-item"
                onClick={() => handleSelectPage(p.id)}
              >
                <div className="search-item-left">
                  <Icon size={16} className="search-item-icon" />
                  <span className="search-item-title">{p.label}</span>
                  <span className="search-item-badge">{p.category}</span>
                </div>
                <ArrowRight size={14} className="search-item-arrow" />
              </div>
            );
          })}
        </div>

        {/* Expenses Results */}
        {filteredExpenses.length > 0 && (
          <div className="search-section">
            <div className="search-section-title">TRANSACTIONS</div>
            {filteredExpenses.map((e) => (
              <div
                key={e.id}
                className="search-result-item"
                onClick={() => {
                  setActivePage('Expenses');
                  setIsQuickSearchOpen(false);
                }}
              >
                <div className="search-item-left">
                  <Receipt size={16} className="search-item-icon" />
                  <div>
                    <span className="search-item-title">{e.merchant}</span>
                    <span className="search-item-sub"> · {e.category} · {e.date}</span>
                  </div>
                </div>
                <span className="search-expense-amount">
                  {formatCurrency(e.amount, user.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
