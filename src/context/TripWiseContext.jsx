import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_USER,
  INITIAL_EXPENSES,
  INITIAL_TRIPS,
  INITIAL_TRIP_EXPENSES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

const TripWiseContext = createContext();

const STORAGE_KEYS = {
  USER: 'tripwise_user_v2',
  EXPENSES: 'tripwise_expenses_v2',
  TRIPS: 'tripwise_trips_v2',
  TRIP_EXPENSES: 'tripwise_trip_expenses_v2',
  NOTIFICATIONS: 'tripwise_notifications_v2',
  THEME: 'tripwise_theme_v2',
};

export const TripWiseProvider = ({ children }) => {
  // 1. User & Settings
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // 2. Theme (Dark / Light)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved ? JSON.parse(saved) : true; // Default dark navy foundation
    } catch {
      return true;
    }
  });

  // 3. Navigation
  const [activePage, setActivePage] = useState('Overview');

  // 4. Expenses
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  // 5. Trips
  const [trips, setTrips] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  // 6. Active Trip
  const [activeTripId, setActiveTripId] = useState('trip-goa-2026');

  // 7. Trip Expenses map
  const [tripExpenses, setTripExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIP_EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_TRIP_EXPENSES;
    } catch {
      return INITIAL_TRIP_EXPENSES;
    }
  });

  // 8. Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // 9. Modals & Drawer State
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 10. Toasts
  const [toasts, setToasts] = useState([]);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch {}
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIP_EXPENSES, JSON.stringify(tripExpenses));
    } catch {}
  }, [tripExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Toast dispatch helper
  const addToast = ({ title, message, type = 'info' }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // User Actions
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
    addToast({
      title: 'Settings Saved',
      message: 'Your profile and budget preferences have been updated.',
      type: 'success',
    });
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Expense CRUD
  const addExpense = (expenseData) => {
    const newExpense = {
      id: `exp-${Date.now()}`,
      merchant: expenseData.merchant || 'General Expense',
      amount: Number(expenseData.amount) || 0,
      category: expenseData.category || 'Food',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      paymentMethod: expenseData.paymentMethod || 'UPI',
      notes: expenseData.notes || '',
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // If assigned to a trip, also log in that trip's ledger
    if (expenseData.tripId) {
      addTripExpense(expenseData.tripId, {
        merchant: newExpense.merchant,
        amount: newExpense.amount,
        category: newExpense.category === 'Food' ? 'Food' : newExpense.category === 'Transport' ? 'Transport' : 'Shopping',
        date: newExpense.date,
        notes: newExpense.notes,
      });
    }

    addToast({
      title: 'Expense Added',
      message: `Logged ${user.currency === 'INR' ? '₹' : '$'}${newExpense.amount} for ${newExpense.merchant}.`,
      type: 'success',
    });
  };

  const editExpense = (id, updatedData) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedData, amount: Number(updatedData.amount) } : e))
    );
    addToast({
      title: 'Expense Updated',
      message: `Changes saved for ${updatedData.merchant}.`,
      type: 'info',
    });
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast({
      title: 'Expense Removed',
      message: 'The transaction has been deleted.',
      type: 'info',
    });
  };

  const importExpenses = (importedList) => {
    setExpenses((prev) => [...importedList, ...prev]);
    addToast({
      title: 'CSV Import Complete',
      message: `Successfully imported ${importedList.length} expenses into your ledger.`,
      type: 'success',
    });
  };

  // Trip Actions
  const addTrip = (tripData) => {
    const newTrip = {
      id: `trip-${Date.now()}`,
      destination: tripData.destination || 'New Destination',
      title: tripData.title || `${tripData.destination} Trip`,
      days: Number(tripData.days) || 3,
      nights: Math.max(1, (Number(tripData.days) || 3) - 1),
      dates: tripData.dates || 'Upcoming 2026',
      monthYear: tripData.monthYear || '2026',
      travelers: Number(tripData.travelers) || 1,
      budget: Number(tripData.budget) || 10000,
      spent: 0,
      status: 'Upcoming',
      daysElapsed: 0,
      image: tripData.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      coverImage: tripData.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      travelStyle: tripData.travelStyle || 'Moderate',
      categoryAllocations: tripData.categoryAllocations || {},
      recoveryApplied: false,
    };

    setTrips((prev) => [newTrip, ...prev]);
    setTripExpenses((prev) => ({ ...prev, [newTrip.id]: [] }));
    setActiveTripId(newTrip.id);

    addToast({
      title: 'Trip Created',
      message: `Planned ${newTrip.destination} with a budget of ₹${newTrip.budget.toLocaleString('en-IN')}.`,
      type: 'success',
    });
  };

  const addTripExpense = (tripId, expenseData) => {
    const newEntry = {
      id: `te-${Date.now()}`,
      merchant: expenseData.merchant || 'Trip Expense',
      amount: Number(expenseData.amount) || 0,
      category: expenseData.category || 'Food',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      notes: expenseData.notes || '',
    };

    setTripExpenses((prev) => {
      const current = prev[tripId] || [];
      return { ...prev, [tripId]: [newEntry, ...current] };
    });

    // Update trip total spent
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const newSpent = (Number(t.spent) || 0) + newEntry.amount;
          return { ...t, spent: newSpent };
        }
        return t;
      })
    );

    addToast({
      title: 'Trip Expense Logged',
      message: `Added ₹${newEntry.amount} to trip ledger.`,
      type: 'success',
    });
  };

  const deleteTripExpense = (tripId, expenseId) => {
    const target = (tripExpenses[tripId] || []).find((e) => e.id === expenseId);
    const amountToDeduct = target ? Number(target.amount) : 0;

    setTripExpenses((prev) => ({
      ...prev,
      [tripId]: (prev[tripId] || []).filter((e) => e.id !== expenseId),
    }));

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return { ...t, spent: Math.max(0, (Number(t.spent) || 0) - amountToDeduct) };
        }
        return t;
      })
    );

    addToast({
      title: 'Expense Deleted',
      message: 'Trip expense was removed.',
      type: 'info',
    });
  };

  // AI Recovery Application
  const applyRecoveryPlan = (tripId, recoveryPlan) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            projectedSpendOverride: recoveryPlan.newProjectedSpend,
            recoveryApplied: true,
            recoveryDetails: recoveryPlan,
          };
        }
        return t;
      })
    );

    addToast({
      title: 'AI Recovery Applied! 🚀',
      message: `Projected spend rebalanced to ₹${recoveryPlan.newProjectedSpend.toLocaleString('en-IN')}. Budget protected!`,
      type: 'success',
    });
  };

  const resetRecoveryPlan = (tripId) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            projectedSpendOverride: 13750, // revert to demo overspend
            recoveryApplied: false,
            recoveryDetails: null,
          };
        }
        return t;
      })
    );

    addToast({
      title: 'Recovery Reset',
      message: 'Reverted trip projection to unadjusted state.',
      type: 'info',
    });
  };

  // Reset to default demo data
  const resetDemoData = () => {
    setUser(INITIAL_USER);
    setExpenses(INITIAL_EXPENSES);
    setTrips(INITIAL_TRIPS);
    setTripExpenses(INITIAL_TRIP_EXPENSES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTripId('trip-goa-2026');
    setDarkMode(true);
    localStorage.clear();

    addToast({
      title: 'Demo Data Restored',
      message: 'All balances, trips, and demo state have been reset.',
      type: 'info',
    });
  };

  return (
    <TripWiseContext.Provider
      value={{
        user,
        updateUser,
        darkMode,
        toggleTheme,
        activePage,
        setActivePage,
        expenses,
        addExpense,
        editExpense,
        deleteExpense,
        importExpenses,
        trips,
        activeTripId,
        setActiveTripId,
        addTrip,
        tripExpenses,
        addTripExpense,
        deleteTripExpense,
        applyRecoveryPlan,
        resetRecoveryPlan,
        notifications,
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen,
        isQuickSearchOpen,
        setIsQuickSearchOpen,
        editingExpense,
        setEditingExpense,
        mobileMenuOpen,
        setMobileMenuOpen,
        toasts,
        addToast,
        removeToast,
        resetDemoData,
      }}
    >
      {children}
    </TripWiseContext.Provider>
  );
};

export const useTripWise = () => {
  const context = useContext(TripWiseContext);
  if (!context) {
    throw new Error('useTripWise must be used within a TripWiseProvider');
  }
  return context;
};
