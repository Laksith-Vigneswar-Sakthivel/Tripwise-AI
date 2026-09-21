import React, { useState, useRef, useEffect } from 'react';
import { useTripWise } from '../../context/TripWiseContext';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Plus,
  ChevronRight,
} from 'lucide-react';

export const TopBar = () => {
  const {
    activePage,
    setActivePage,
    darkMode,
    toggleTheme,
    notifications,
    markNotificationAsRead,
    setIsAddExpenseModalOpen,
    setIsQuickSearchOpen,
    setMobileMenuOpen,
  } = useTripWise();

  const [showNotifications, setShowNotifications] = useState(false);

  const notifRef = useRef(null);

  // =========================================================
  // DYNAMIC UNREAD COUNT
  // =========================================================

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const unreadText =
    unreadCount === 0
      ? 'All caught up'
      : `${unreadCount} unread ${
          unreadCount === 1 ? 'insight' : 'insights'
        }`;

  // =========================================================
  // CLOSE NOTIFICATIONS ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // CTRL + K / CMD + K
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        setIsQuickSearchOpen(true);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [setIsQuickSearchOpen]);

  // =========================================================
  // NOTIFICATION CLICK
  // =========================================================

  const handleNotificationClick = (item) => {
    // Mark notification as read
    markNotificationAsRead(item.id);

    // Navigate to related page if available
    if (item.actionPage) {
      setActivePage(item.actionPage);
    }

    // Close dropdown
    setShowNotifications(false);
  };

  // =========================================================
  // TOGGLE NOTIFICATIONS
  // =========================================================

  const toggleNotifications = () => {
    setShowNotifications((previous) => !previous);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header className="topbar">

      {/* =====================================================
          LEFT
      ====================================================== */}

      <div className="topbar-left">

        {/* Mobile Menu */}
        <button
          type="button"
          className="topbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumb"
        >
          <span className="breadcrumb-root">
            TripWise AI
          </span>

          <ChevronRight
            size={14}
            className="breadcrumb-separator"
          />

          <span className="breadcrumb-current">
            {activePage}
          </span>
        </nav>
      </div>

      {/* =====================================================
          CENTER SEARCH
      ====================================================== */}

      <div className="topbar-center">

        <button
          type="button"
          className="topbar-search-btn"
          onClick={() =>
            setIsQuickSearchOpen(true)
          }
          aria-label="Search and quick actions"
        >
          <Search
            size={15}
            className="search-icon"
          />

          <span className="search-placeholder">
            Search transactions, pages...
          </span>

          <kbd className="search-kbd">
            Ctrl K
          </kbd>
        </button>

      </div>

      {/* =====================================================
          RIGHT ACTIONS
      ====================================================== */}

      <div className="topbar-right">

        {/* ===================================================
            THEME TOGGLE
        ==================================================== */}

        <button
          type="button"
          className="topbar-icon-btn"
          onClick={toggleTheme}
          title={
            darkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          aria-label={
            darkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          {darkMode ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {/* ===================================================
            NOTIFICATIONS
        ==================================================== */}

        <div
          className="topbar-notif-wrap"
          ref={notifRef}
        >
          <button
            type="button"
            className="topbar-icon-btn notif-btn"
            onClick={toggleNotifications}
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread ${
                    unreadCount === 1
                      ? 'notification'
                      : 'notifications'
                  }`
                : 'Notifications'
            }
          >
            <Bell size={18} />

            {/* Dynamic notification badge */}
            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 99
                  ? '99+'
                  : unreadCount}
              </span>
            )}
          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================== */}

          {showNotifications && (
            <div className="notifications-dropdown">

              {/* Header */}
              <div className="notif-dropdown-header">
                <div>
                  <h4>
                    AI Notifications
                  </h4>

                  <span className="notif-sub">
                    {unreadText}
                  </span>
                </div>
              </div>

              {/* Notification List */}
              <div className="notif-list">

                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={20} />

                    <span>
                      No notifications yet.
                    </span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`notif-item ${
                        item.unread
                          ? 'notif-unread'
                          : ''
                      }`}
                      onClick={() =>
                        handleNotificationClick(
                          item
                        )
                      }
                    >
                      {/* Status Dot */}
                      <div
                        className={`notif-status-dot notif-status-${
                          item.type || 'info'
                        }`}
                      />

                      {/* Content */}
                      <div className="notif-content">

                        <div className="notif-title-row">
                          <span className="notif-item-title">
                            {item.title}
                          </span>

                          <span className="notif-item-time">
                            {item.time}
                          </span>
                        </div>

                        <p className="notif-item-desc">
                          {item.message}
                        </p>

                      </div>
                    </button>
                  ))
                )}

              </div>

              {/* Footer */}
              <div className="notif-dropdown-footer">
                <button
                  type="button"
                  className="notif-clear-btn"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                >
                  Close notifications
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ===================================================
            ADD EXPENSE
        ==================================================== */}

        <button
          type="button"
          className="btn btn-primary topbar-add-expense-btn"
          onClick={() =>
            setIsAddExpenseModalOpen(true)
          }
        >
          <Plus size={16} />

          <span>
            Add Expense
          </span>
        </button>

      </div>
    </header>
  );
};