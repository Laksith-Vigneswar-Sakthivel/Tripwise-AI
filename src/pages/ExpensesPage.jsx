import React, { useState, useMemo } from 'react';
import { useTripWise } from '../context/TripWiseContext';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { CsvImportModal } from '../components/modals/CsvImportModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { filterAndSortExpenses, exportExpensesToCsv } from '../services/expenseService';
import {
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Receipt,
  TrendingUp,
  Tag,
  CreditCard,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Travel',
  'Other',
];

export const ExpensesPage = () => {
  const {
    expenses,
    user,
    deleteExpense,
    setEditingExpense,
    setIsAddExpenseModalOpen,
  } = useTripWise();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Summary Metrics calculations
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const averageTransaction = useMemo(
    () => (expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0),
    [expenses, totalExpenses]
  );

  const largestExpense = useMemo(
    () =>
      expenses.length > 0
        ? Math.max(...expenses.map((e) => Number(e.amount || 0)))
        : 0,
    [expenses]
  );

  const topCategory = useMemo(() => {
    if (expenses.length === 0) return 'None';
    const catMap = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount || 0);
    });
    let top = 'Food';
    let max = 0;
    for (const [k, v] of Object.entries(catMap)) {
      if (v > max) {
        max = v;
        top = k;
      }
    }
    return top;
  }, [expenses]);

  // Filtered & sorted expense list
  const filteredList = useMemo(() => {
    return filterAndSortExpenses(expenses, {
      search,
      category: selectedCategory,
      sortBy,
      startDate,
      endDate,
    });
  }, [expenses, search, selectedCategory, sortBy, startDate, endDate]);

  const handleExportCsv = () => {
    const csvData = exportExpensesToCsv(filteredList);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tripwise-expenses-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="TRANSACTIONS"
        title="Expenses & Statements"
        subtitle="Manage daily transactions, track categorization, and import card statements."
        actions={
          <div className="header-button-group">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsCsvModalOpen(true)}
            >
              <Upload size={14} />
              <span>Import CSV</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleExportCsv}
              disabled={filteredList.length === 0}
            >
              <Download size={14} />
              <span>Export CSV</span>
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

      {/* 4 Summary Cards */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses, user.currency)}
          subtitle={`${expenses.length} transactions recorded`}
          icon={Receipt}
        />
        <MetricCard
          label="Average Transaction"
          value={formatCurrency(averageTransaction, user.currency)}
          subtitle="Per payment average"
          icon={CreditCard}
        />
        <MetricCard
          label="Largest Expense"
          value={formatCurrency(largestExpense, user.currency)}
          subtitle="Single purchase peak"
          icon={TrendingUp}
        />
        <MetricCard
          label="Top Category"
          value={topCategory}
          subtitle="Primary spending driver"
          icon={Tag}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar-card">
        <div className="filter-search-wrap">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search merchant, category, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="filter-controls-group">
          {/* Category Dropdown */}
          <div className="filter-item">
            <Filter size={14} className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="filter-item">
            <ArrowUpDown size={14} className="filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: Highest First</option>
              <option value="amount_asc">Amount: Lowest First</option>
            </select>
          </div>

          {/* Date range inputs */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="filter-date-input"
            title="Start date"
          />
          <span className="date-sep">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="filter-date-input"
            title="End date"
          />

          {(search || selectedCategory !== 'All' || startDate || endDate) && (
            <button
              type="button"
              className="btn-clear-filters"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="expenses-table-card">
        {filteredList.length === 0 ? (
          <div className="empty-state-view">
            <Receipt size={40} className="empty-state-icon" />
            <h3>No expenses match your filters</h3>
            <p>Try searching for a different merchant or clear your category and date filters.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item.id} className="data-table-row">
                    <td>
                      <div className="merchant-cell">
                        <div className="merchant-avatar">
                          {item.merchant.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="merchant-name">{item.merchant}</div>
                          {item.notes && (
                            <div className="merchant-notes">{item.notes}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`cat-pill cat-pill-${item.category.toLowerCase()}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="text-muted-cell">{formatDate(item.date)}</td>
                    <td className="text-muted-cell font-mono">{item.paymentMethod || 'UPI'}</td>
                    <td className="text-right font-mono font-semibold">
                      {formatCurrency(item.amount, user.currency)}
                    </td>
                    <td className="text-center actions-col">
                      <div className="row-actions-group">
                        <button
                          type="button"
                          className="table-action-btn"
                          title="Edit transaction"
                          onClick={() => {
  setEditingExpense(item);
  setIsAddExpenseModalOpen(true);
}}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn btn-danger-icon"
                          title="Delete transaction"
                          onClick={() => deleteExpense(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-pagination-footer">
          <span className="pagination-info">
            Showing {filteredList.length} of {expenses.length} recorded expenses
          </span>
        </div>
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </div>
  );
};
