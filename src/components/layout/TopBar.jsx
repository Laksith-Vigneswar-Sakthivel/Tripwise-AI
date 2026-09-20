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
    setIsAddExpenseModalOpen,
    setIsQuickSearchOpen,
    setMobileMenuOpen,
  } = useTripWise();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close notifications on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsQuickSearchOpen]);

  const handleNotificationClick = (item) => {
    if (item.actionPage) {
      setActivePage(item.actionPage);
    }
    setShowNotifications(false);
  };

  return (
    <header className="topbar">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-root">TripWise AI</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{activePage}</span>
        </nav>
      </div>

      {/* Center/Search Action */}
      <div className="topbar-center">
        <button
          type="button"
          className="topbar-search-btn"
          onClick={() => setIsQuickSearchOpen(true)}
          aria-label="Search and quick actions"
        >
          <Search size={15} className="search-icon" />
          <span className="search-placeholder">Search transactions, pages...</span>
          <kbd className="search-kbd">Ctrl K</kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="topbar-right">
        {/* Theme Toggle */}
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={toggleTheme}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-btn notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-dropdown-header">
                <div>
                  <h4>AI Notifications</h4>
                  <span className="notif-sub">{unreadCount} unread insights</span>
                </div>
              </div>

              <div className="notif-list">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notif-item ${item.unread ? 'notif-unread' : ''}`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <div className={`notif-status-dot notif-status-${item.type || 'info'}`} />
                    <div className="notif-content">
                      <div className="notif-title-row">
                        <span className="notif-item-title">{item.title}</span>
                        <span className="notif-item-time">{item.time}</span>
                      </div>
                      <p className="notif-item-desc">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notif-dropdown-footer">
                <button
                  type="button"
                  className="notif-clear-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action: Add Expense */}
        <button
          type="button"
          className="btn btn-primary topbar-add-expense-btn"
          onClick={() => setIsAddExpenseModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
};
