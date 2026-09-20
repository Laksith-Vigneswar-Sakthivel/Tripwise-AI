import React, { useState } from 'react';
import { useTripWise } from '../../context/TripWiseContext';
import { Modal } from '../common/Modal';
import { Check, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Travel',
  'Other',
];

const EditExpenseForm = ({ expense, onSave, onDelete, onCancel, currency }) => {
  const [formData, setFormData] = useState({
    merchant: expense.merchant || '',
    amount: expense.amount || '',
    category: expense.category || 'Food',
    date: expense.date || '',
    notes: expense.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.merchant.trim() || !formData.amount) return;
    onSave(expense.id, formData);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete expense for "${expense.merchant}"?`)) {
      onDelete(expense.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <div className="form-group">
        <label className="form-label" htmlFor="edit-merchant">
          Merchant / Payee
        </label>
        <input
          id="edit-merchant"
          type="text"
          required
          value={formData.merchant}
          onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label className="form-label" htmlFor="edit-amount">
            Amount ({currency === 'INR' ? '₹' : '$'})
          </label>
          <input
            id="edit-amount"
            type="number"
            min="1"
            step="any"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="form-input font-mono"
          />
        </div>

        <div className="form-group flex-1">
          <label className="form-label" htmlFor="edit-date">
            Date
          </label>
          <input
            id="edit-date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-category">
          Category
        </label>
        <select
          id="edit-category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="form-select"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-notes">
          Notes
        </label>
        <input
          id="edit-notes"
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="form-input"
        />
      </div>

      <div className="modal-actions-split">
        <button
          type="button"
          className="btn btn-danger-soft"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>

        <div className="modal-actions-right">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Check size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export const EditExpenseModal = () => {
  const { editingExpense, setEditingExpense, editExpense, deleteExpense, user } = useTripWise();

  if (!editingExpense) return null;

  return (
    <Modal
      isOpen={Boolean(editingExpense)}
      onClose={() => setEditingExpense(null)}
      title="Edit Expense"
      subtitle="Modify transaction details."
      maxWidth="480px"
    >
      <EditExpenseForm
        key={editingExpense.id}
        expense={editingExpense}
        currency={user.currency}
        onSave={(id, data) => {
          editExpense(id, data);
          setEditingExpense(null);
        }}
        onDelete={(id) => {
          deleteExpense(id);
          setEditingExpense(null);
        }}
        onCancel={() => setEditingExpense(null)}
      />
    </Modal>
  );
};
