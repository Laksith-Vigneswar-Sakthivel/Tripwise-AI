import React, { useEffect, useState } from 'react';
import { useTripWise } from '../../context/TripWiseContext';
import { Modal } from '../common/Modal';
import { categorizeExpense } from '../../services/aiFinanceService';
import { Sparkles, PlusCircle, Save } from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Travel',
  'Other',
];

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'NetBanking',
];

const EMPTY_FORM = {
  merchant: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'UPI',
  tripId: '',
  notes: '',
};

export const AddExpenseModal = () => {
  const {
    isAddExpenseModalOpen,
    setIsAddExpenseModalOpen,
    addExpense,
    editExpense,
    editingExpense,
    setEditingExpense,
    trips,
    user,
  } = useTripWise();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [autoCategorySuggested, setAutoCategorySuggested] = useState(false);

  const isEditing = Boolean(editingExpense);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        merchant: editingExpense.merchant || '',
        amount: editingExpense.amount ?? '',
        category: editingExpense.category || 'Food',
        date:
          editingExpense.date ||
          new Date().toISOString().split('T')[0],
        paymentMethod: editingExpense.paymentMethod || 'UPI',
        tripId: editingExpense.tripId || '',
        notes: editingExpense.notes || '',
      });

      setAutoCategorySuggested(false);
    } else {
      setFormData({
        ...EMPTY_FORM,
        date: new Date().toISOString().split('T')[0],
      });

      setAutoCategorySuggested(false);
    }
  }, [editingExpense, isAddExpenseModalOpen]);

  const closeModal = () => {
    setIsAddExpenseModalOpen(false);
    setEditingExpense(null);

    setFormData({
      ...EMPTY_FORM,
      date: new Date().toISOString().split('T')[0],
    });

    setAutoCategorySuggested(false);
  };

  const handleMerchantChange = (e) => {
    const val = e.target.value;
    const suggested = categorizeExpense(val);

    const updates = {
      merchant: val,
    };

    if (suggested && suggested !== 'Other' && val.length >= 3) {
      updates.category = suggested;
      setAutoCategorySuggested(true);
    } else {
      setAutoCategorySuggested(false);
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.merchant.trim() ||
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      return;
    }

    const expenseData = {
      ...formData,
      amount: Number(formData.amount),
    };

    if (isEditing) {
      editExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={isAddExpenseModalOpen}
      onClose={closeModal}
      title={isEditing ? 'Edit Expense' : 'Add New Expense'}
      subtitle={
        isEditing
          ? 'Update the transaction details below.'
          : 'Log a general expense or allocate it towards an upcoming trip.'
      }
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-group">
          <label className="form-label" htmlFor="expense-merchant">
            Merchant / Payee <span className="required">*</span>
          </label>

          <input
            id="expense-merchant"
            type="text"
            required
            placeholder="e.g. Swiggy, Uber, Amazon, Starbucks"
            value={formData.merchant}
            onChange={handleMerchantChange}
            className="form-input"
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="expense-amount">
              Amount ({user.currency === 'INR' ? '₹' : '$'}){' '}
              <span className="required">*</span>
            </label>

            <input
              id="expense-amount"
              type="number"
              min="1"
              step="any"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value,
                })
              }
              className="form-input font-mono"
            />
          </div>

          <div className="form-group flex-1">
            <label className="form-label" htmlFor="expense-date">
              Date
            </label>

            <input
              id="expense-date"
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <div className="form-label-with-ai">
              <label className="form-label" htmlFor="expense-category">
                Category
              </label>

              {autoCategorySuggested && (
                <span className="ai-suggested-tag">
                  <Sparkles size={11} />
                  AI Auto-tagged
                </span>
              )}
            </div>

            <select
              id="expense-category"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
              className="form-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label className="form-label" htmlFor="expense-payment">
              Payment Method
            </label>

            <select
              id="expense-payment"
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value,
                })
              }
              className="form-select"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expense-trip">
            Tag to Trip (Optional)
          </label>

          <select
            id="expense-trip"
            value={formData.tripId}
            onChange={(e) =>
              setFormData({
                ...formData,
                tripId: e.target.value,
              })
            }
            className="form-select"
          >
            <option value="">-- No Trip (General Expense) --</option>

            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.destination} ({trip.monthYear}) - Budget: ₹
                {Number(trip.budget || 0).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expense-notes">
            Notes / Details (Optional)
          </label>

          <input
            id="expense-notes"
            type="text"
            placeholder="e.g. Airport cab, team dinner, gear purchase"
            value={formData.notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
            className="form-input"
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeModal}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-primary">
            {isEditing ? <Save size={16} /> : <PlusCircle size={16} />}

            <span>
              {isEditing ? 'Update Expense' : 'Save Expense'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};