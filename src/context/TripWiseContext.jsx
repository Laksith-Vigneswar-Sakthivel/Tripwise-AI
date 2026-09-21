import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';

import {
  INITIAL_USER,
  INITIAL_EXPENSES,
  INITIAL_TRIPS,
  INITIAL_TRIP_EXPENSES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

const client = generateClient();

const TripWiseContext = createContext();

const STORAGE_KEYS = {
  USER: 'tripwise_user_v2',
  EXPENSES: 'tripwise_expenses_v2',
  TRIPS: 'tripwise_trips_v2',
  TRIP_EXPENSES: 'tripwise_trip_expenses_v2',
  NOTIFICATIONS: 'tripwise_notifications_v2',
  THEME: 'tripwise_theme_v2',
};

// =========================================================
// PROVIDER
// =========================================================

export const TripWiseProvider = ({
  children,
  authUser,
}) => {
  // =========================================================
  // USER
  // =========================================================

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(
        STORAGE_KEYS.USER
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // =========================================================
  // SYNC COGNITO PROFILE
  // =========================================================

  useEffect(() => {
    if (!authUser) return;

    let cancelled = false;

    const loadCognitoProfile = async () => {
      try {
        const attributes =
          await fetchUserAttributes();

        if (cancelled) return;

        const givenName =
          attributes?.given_name?.trim() || '';

        const familyName =
          attributes?.family_name?.trim() || '';

        const fullName =
          attributes?.name?.trim() || '';

        const email =
          attributes?.email?.trim() || '';

        let displayName = '';

        // 1. Cognito full name
        if (fullName) {
          displayName = fullName;
        }

        // 2. First + last name
        else if (
          givenName ||
          familyName
        ) {
          displayName = [
            givenName,
            familyName,
          ]
            .filter(Boolean)
            .join(' ');
        }

        // 3. Email username
        else if (email) {
          displayName = email
            .split('@')[0]
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            );
        }

        // 4. Safe fallback
        else {
          displayName = 'User';
        }

        setUser((prev) => ({
          ...prev,
          name: displayName,
          email:
            email ||
            prev.email ||
            '',
        }));
      } catch (error) {
        console.error(
          'Failed to load Cognito profile:',
          error
        );

        if (cancelled) return;

        // IMPORTANT:
        // Never display the Cognito UUID.
        setUser((prev) => ({
          ...prev,
          name:
            prev.name &&
            prev.name !== 'Laksith'
              ? prev.name
              : 'User',
        }));
      }
    };

    loadCognitoProfile();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  // =========================================================
  // THEME
  // =========================================================

  const [darkMode, setDarkMode] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.THEME
          );

        return saved
          ? JSON.parse(saved)
          : true;
      } catch {
        return true;
      }
    });

  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activePage, setActivePage] =
    useState('Overview');

  // =========================================================
  // EXPENSES
  // =========================================================

  const [expenses, setExpenses] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.EXPENSES
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_EXPENSES;
      } catch {
        return INITIAL_EXPENSES;
      }
    });

  // =========================================================
  // TRIPS
  // =========================================================

  const [trips, setTrips] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.TRIPS
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_TRIPS;
      } catch {
        return INITIAL_TRIPS;
      }
    });

  // =========================================================
  // ACTIVE TRIP
  // =========================================================

  const [activeTripId, setActiveTripId] =
    useState('trip-goa-2026');

  // =========================================================
  // TRIP EXPENSES
  // =========================================================

  const [tripExpenses, setTripExpenses] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.TRIP_EXPENSES
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_TRIP_EXPENSES;
      } catch {
        return INITIAL_TRIP_EXPENSES;
      }
    });

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [notifications, setNotifications] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEYS.NOTIFICATIONS
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_NOTIFICATIONS;
      } catch {
        return INITIAL_NOTIFICATIONS;
      }
    });

  // =========================================================
  // MODALS / DRAWER
  // =========================================================

  const [
    isAddExpenseModalOpen,
    setIsAddExpenseModalOpen,
  ] = useState(false);

  const [
    isQuickSearchOpen,
    setIsQuickSearchOpen,
  ] = useState(false);

  const [
    editingExpense,
    setEditingExpense,
  ] = useState(null);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  // =========================================================
  // TOASTS
  // =========================================================

  const [toasts, setToasts] =
    useState([]);

  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(user)
      );
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.THEME,
        JSON.stringify(darkMode)
      );

      if (darkMode) {
        document.documentElement.classList.add(
          'dark'
        );

        document.documentElement.classList.remove(
          'light'
        );
      } else {
        document.documentElement.classList.add(
          'light'
        );

        document.documentElement.classList.remove(
          'dark'
        );
      }
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.EXPENSES,
        JSON.stringify(expenses)
      );
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRIPS,
        JSON.stringify(trips)
      );
    } catch {}
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.TRIP_EXPENSES,
        JSON.stringify(
          tripExpenses
        )
      );
    } catch {}
  }, [tripExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(
          notifications
        )
      );
    } catch {}
  }, [notifications]);

  // =========================================================
  // TOAST
  // =========================================================

  const addToast = ({
    title,
    message,
    type = 'info',
  }) => {
    const id =
      `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 4)}`;

    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter(
          (toast) =>
            toast.id !== id
        )
      );
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.filter(
        (toast) =>
          toast.id !== id
      )
    );
  };

  // =========================================================
  // USER ACTIONS
  // =========================================================

  const updateUser = (
    updates
  ) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));

    addToast({
      title: 'Settings Saved',
      message:
        'Your profile and budget preferences have been updated.',
      type: 'success',
    });
  };

  const toggleTheme = () => {
    setDarkMode(
      (prev) => !prev
    );
  };

  // =========================================================
  // ADD EXPENSE
  // =========================================================

  const addExpense = async (
    expenseData
  ) => {
    const newExpense = {
      id: `exp-${Date.now()}`,

      merchant:
        expenseData.merchant ||
        'General Expense',

      amount:
        Number(
          expenseData.amount
        ) || 0,

      category:
        expenseData.category ||
        'Food',

      date:
        expenseData.date ||
        new Date()
          .toISOString()
          .split('T')[0],

      paymentMethod:
        expenseData.paymentMethod ||
        'UPI',

      notes:
        expenseData.notes || '',
    };

    setExpenses((prev) => [
      newExpense,
      ...prev,
    ]);

    try {
      const {
        data,
        errors,
      } =
        await client.models.Expense.create(
          {
            category:
              newExpense.category,

            amount:
              newExpense.amount,

            description:
              newExpense.notes ||
              newExpense.merchant,

            date:
              newExpense.date,

            tripId:
              expenseData.tripId ||
              null,
          }
        );

      if (errors?.length) {
        console.error(
          'AWS Expense save failed:',
          errors
        );
      } else {
        console.log(
          '✅ Expense saved to AWS',
          data
        );
      }
    } catch (error) {
      console.error(
        'AWS Expense save failed:',
        error
      );
    }

    if (expenseData.tripId) {
      await addTripExpense(
        expenseData.tripId,
        {
          merchant:
            newExpense.merchant,

          amount:
            newExpense.amount,

          category:
            newExpense.category ===
            'Food'
              ? 'Food'
              : newExpense.category ===
                'Transport'
              ? 'Transport'
              : 'Shopping',

          date:
            newExpense.date,

          notes:
            newExpense.notes,
        }
      );
    }

    addToast({
      title: 'Expense Added',

      message: `Logged ${
        user.currency === 'INR'
          ? '₹'
          : '$'
      }${newExpense.amount} for ${
        newExpense.merchant
      }.`,

      type: 'success',
    });
  };

  // =========================================================
  // EDIT EXPENSE
  // =========================================================

  const editExpense = (
    id,
    updatedData
  ) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              ...updatedData,
              amount: Number(
                updatedData.amount
              ),
            }
          : expense
      )
    );

    addToast({
      title: 'Expense Updated',

      message: `Changes saved for ${updatedData.merchant}.`,

      type: 'info',
    });
  };

  // =========================================================
  // DELETE EXPENSE
  // =========================================================

  const deleteExpense = (
    id
  ) => {
    setExpenses((prev) =>
      prev.filter(
        (expense) =>
          expense.id !== id
      )
    );

    addToast({
      title: 'Expense Removed',

      message:
        'The transaction has been deleted.',

      type: 'info',
    });
  };

  // =========================================================
  // IMPORT EXPENSES
  // =========================================================

  const importExpenses = (
    importedList
  ) => {
    setExpenses((prev) => [
      ...importedList,
      ...prev,
    ]);

    addToast({
      title:
        'CSV Import Complete',

      message: `Successfully imported ${importedList.length} expenses into your ledger.`,

      type: 'success',
    });
  };

  // =========================================================
  // ADD TRIP
  // =========================================================

  const addTrip = async (
    tripData
  ) => {
    const newTrip = {
      id: `trip-${Date.now()}`,

      destination:
        tripData.destination ||
        'New Destination',

      title:
        tripData.title ||
        `${tripData.destination} Trip`,

      days:
        Number(
          tripData.days
        ) || 3,

      nights: Math.max(
        1,
        (Number(
          tripData.days
        ) || 3) - 1
      ),

      dates:
        tripData.dates ||
        'Upcoming 2026',

      monthYear:
        tripData.monthYear ||
        '2026',

      travelers:
        Number(
          tripData.travelers
        ) || 1,

      budget:
        Number(
          tripData.budget
        ) || 10000,

      spent: 0,

      status: 'Upcoming',

      daysElapsed: 0,

      image:
        tripData.image ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',

      coverImage:
        tripData.image ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',

      travelStyle:
        tripData.travelStyle ||
        'Moderate',

      categoryAllocations:
        tripData.categoryAllocations ||
        {},

      recoveryApplied: false,
    };

    try {
      const {
        data,
        errors,
      } =
        await client.models.Trip.create(
          {
            title:
              newTrip.title,

            destination:
              newTrip.destination,

            startDate:
              newTrip.dates,

            endDate:
              newTrip.dates,

            budget:
              newTrip.budget,

            status:
              newTrip.status,
          }
        );

      if (errors?.length) {
        console.error(
          'AWS Trip save failed:',
          errors
        );
      } else {
        console.log(
          '✅ Trip saved to AWS',
          data
        );
      }
    } catch (error) {
      console.error(
        'AWS Trip save failed:',
        error
      );
    }

    setTrips((prev) => [
      newTrip,
      ...prev,
    ]);

    setTripExpenses((prev) => ({
      ...prev,
      [newTrip.id]: [],
    }));

    setActiveTripId(
      newTrip.id
    );

    addToast({
      title: 'Trip Created',

      message: `Planned ${
        newTrip.destination
      } with a budget of ₹${newTrip.budget.toLocaleString(
        'en-IN'
      )}.`,

      type: 'success',
    });
  };

  // =========================================================
  // ADD TRIP EXPENSE
  // =========================================================

  const addTripExpense = async (
    tripId,
    expenseData
  ) => {
    const newEntry = {
      id: `te-${Date.now()}`,

      merchant:
        expenseData.merchant ||
        'Trip Expense',

      amount:
        Number(
          expenseData.amount
        ) || 0,

      category:
        expenseData.category ||
        'Food',

      date:
        expenseData.date ||
        new Date()
          .toISOString()
          .split('T')[0],

      notes:
        expenseData.notes || '',
    };

    setTripExpenses((prev) => {
      const current =
        prev[tripId] || [];

      return {
        ...prev,

        [tripId]: [
          newEntry,
          ...current,
        ],
      };
    });

    try {
      const {
        data,
        errors,
      } =
        await client.models.TripExpense.create(
          {
            tripId,

            category:
              newEntry.category,

            amount:
              newEntry.amount,

            description:
              newEntry.notes ||
              newEntry.merchant,

            date:
              newEntry.date,
          }
        );

      if (errors?.length) {
        console.error(
          'AWS Trip Expense save failed:',
          errors
        );
      } else {
        console.log(
          '✅ Trip expense saved to AWS',
          data
        );
      }
    } catch (error) {
      console.error(
        'AWS Trip Expense save failed:',
        error
      );
    }

    setTrips((prev) =>
      prev.map((trip) => {
        if (
          trip.id === tripId
        ) {
          return {
            ...trip,

            spent:
              (Number(
                trip.spent
              ) || 0) +
              newEntry.amount,
          };
        }

        return trip;
      })
    );

    addToast({
      title:
        'Trip Expense Logged',

      message: `Added ₹${newEntry.amount} to trip ledger.`,

      type: 'success',
    });
  };

  // =========================================================
  // DELETE TRIP EXPENSE
  // =========================================================

  const deleteTripExpense = (
    tripId,
    expenseId
  ) => {
    const target =
      (
        tripExpenses[
          tripId
        ] || []
      ).find(
        (expense) =>
          expense.id ===
          expenseId
      );

    const amountToDeduct =
      target
        ? Number(target.amount)
        : 0;

    setTripExpenses((prev) => ({
      ...prev,

      [tripId]:
        (
          prev[tripId] || []
        ).filter(
          (expense) =>
            expense.id !==
            expenseId
        ),
    }));

    setTrips((prev) =>
      prev.map((trip) => {
        if (
          trip.id === tripId
        ) {
          return {
            ...trip,

            spent: Math.max(
              0,
              (Number(
                trip.spent
              ) || 0) -
                amountToDeduct
            ),
          };
        }

        return trip;
      })
    );

    addToast({
      title: 'Expense Deleted',

      message:
        'Trip expense was removed.',

      type: 'info',
    });
  };

  // =========================================================
  // AI RECOVERY
  // =========================================================

  const applyRecoveryPlan = (
    tripId,
    recoveryPlan
  ) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (
          trip.id === tripId
        ) {
          return {
            ...trip,

            projectedSpendOverride:
              recoveryPlan.newProjectedSpend,

            recoveryApplied:
              true,

            recoveryDetails:
              recoveryPlan,
          };
        }

        return trip;
      })
    );

    addToast({
      title:
        'AI Recovery Applied! 🚀',

      message: `Projected spend rebalanced to ₹${recoveryPlan.newProjectedSpend.toLocaleString(
        'en-IN'
      )}. Budget protected!`,

      type: 'success',
    });
  };

  // =========================================================
  // RESET RECOVERY
  // =========================================================

  const resetRecoveryPlan = (
    tripId
  ) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (
          trip.id === tripId
        ) {
          return {
            ...trip,

            projectedSpendOverride:
              13750,

            recoveryApplied:
              false,

            recoveryDetails:
              null,
          };
        }

        return trip;
      })
    );

    addToast({
      title: 'Recovery Reset',

      message:
        'Reverted trip projection to unadjusted state.',

      type: 'info',
    });
  };

  // =========================================================
  // RESET DEMO DATA
  // =========================================================

  const resetDemoData = () => {
    setUser(INITIAL_USER);

    setExpenses(
      INITIAL_EXPENSES
    );

    setTrips(
      INITIAL_TRIPS
    );

    setTripExpenses(
      INITIAL_TRIP_EXPENSES
    );

    setNotifications(
      INITIAL_NOTIFICATIONS
    );

    setActiveTripId(
      'trip-goa-2026'
    );

    setDarkMode(true);

    localStorage.clear();

    addToast({
      title:
        'Demo Data Restored',

      message:
        'All balances, trips, and demo state have been reset.',

      type: 'info',
    });
  };

  // =========================================================
  // PROVIDER
  // =========================================================

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

        awsClient: client,
      }}
    >
      {children}
    </TripWiseContext.Provider>
  );
};

// =========================================================
// HOOK
// =========================================================

export const useTripWise = () => {
  const context =
    useContext(
      TripWiseContext
    );

  if (!context) {
    throw new Error(
      'useTripWise must be used within a TripWiseProvider'
    );
  }

  return context;
};