import React from 'react';
import { useTripWise } from '../../context/TripWiseContext';
import {
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
  X,
  Compass as LogoIcon,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    group: 'MAIN',
    items: [
      { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'Expenses', label: 'Expenses', icon: Receipt },
      { id: 'Savings', label: 'Savings', icon: PiggyBank },
      { id: 'My Trips', label: 'My Trips', icon: Compass },
    ],
  },
  {
    group: 'TRAVEL',
    items: [
      { id: 'Trip Planner', label: 'Trip Planner', icon: MapPin },
      { id: 'Trip Spending', label: 'Trip Spending', icon: Coins },
    ],
  },
  {
    group: 'INTELLIGENCE',
    items: [
      {
        id: 'AI Recovery',
        label: 'AI Recovery',
        icon: Sparkles,
        badge: 'AI',
        badgeVariant: 'ai',
      },
      { id: 'Insights', label: 'Insights', icon: BarChart3 },
      { id: 'Simulator', label: 'Simulator', icon: Calculator },
    ],
  },
  {
    group: 'SYSTEM',
    items: [{ id: 'Settings', label: 'Settings', icon: Settings }],
  },
];

export const Sidebar = () => {
  const {
    activePage,
    setActivePage,
    user,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useTripWise();

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <div className="brand-icon-box">
              <LogoIcon size={20} className="brand-icon" />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">TripWise</span>
              <span className="brand-ai-badge">AI</span>
            </div>
          </div>

          <span className="brand-sub-tag">AI FINANCE</span>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {NAV_GROUPS.map((section) => (
            <div key={section.group} className="nav-group">
              <div className="nav-group-label">{section.group}</div>
              <ul className="nav-list">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <li key={item.id} className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="nav-link-icon-wrap">
                          <Icon size={18} className="nav-icon" />
                        </span>
                        <span className="nav-link-label">{item.label}</span>

                        {item.badge && (
                          <span className={`nav-badge nav-badge-${item.badgeVariant || 'default'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <span>{user.name ? user.name.charAt(0).toUpperCase() : 'L'}</span>
          </div>
          <div className="profile-info">
            <span className="profile-name">{user.name || 'Laksith'}</span>
            <span className="profile-role">{user.accountType || 'Personal account'}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
