import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiGrid,
  FiClock,
  FiImage,
  FiStar,
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

// Simple AppShell component that wraps the content with navigation
export default function AppShell({
  children,
  activeNav = "",
  title = "",
  subtitle = "",
  contentClassName = "",
  hideSidebar = false,
}) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/dashboard" },
    { id: "timeline", label: "Timeline", icon: FiClock, path: "/timeline" },
    { id: "albums", label: "Albums", icon: FiImage, path: "/albums" },
    {
      id: "milestones",
      label: "Milestones",
      icon: FiStar,
      path: "/milestones",
    },
    { id: "shared", label: "Shared", icon: FiUsers, path: "/shared" },
  ];

  const bottomNavItems = [
    { id: "settings", label: "Settings", icon: FiSettings, path: "/settings" },
    { id: "support", label: "Support", icon: FiHelpCircle, path: "/support" },
  ].filter(
    (item) =>
      !(
        user?.role === "admin" &&
        activeNav === "settings" &&
        item.id === "support"
      ),
  );

  const isActive = (id) => activeNav === id;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-[var(--color-surface-border)]">
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer hover:opacity-90"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                  Memona
                </h1>
                <p className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                  MemoryLane
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              isActive(item.id)
                ? "bg-gradient-to-r from-amber-50 to-amber-100/50 text-[var(--color-accent-gold-dark)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-bg)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {isActive(item.id) && (
              <motion.div
                layoutId="appShellActiveIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-accent-gold)] rounded-r-full"
              />
            )}
            <item.icon
              className={`w-5 h-5 flex-shrink-0 ${isActive(item.id) ? "text-[var(--color-accent-gold)]" : ""}`}
            />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[var(--color-surface-border)] space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.id)
                ? "bg-gradient-to-r from-amber-50 to-amber-100/50 text-[var(--color-accent-gold-dark)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-bg)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <item.icon
              className={`w-5 h-5 flex-shrink-0 ${isActive(item.id) ? "text-[var(--color-accent-gold)]" : ""}`}
            />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[var(--color-surface-bg)] border border-[var(--color-surface-border)] rounded-full items-center justify-center shadow-sm hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors"
      >
        {sidebarCollapsed ? (
          <FiChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
        ) : (
          <FiChevronLeft className="w-4 h-4 text-[var(--color-text-secondary)]" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)]">
      {/* Mobile Overlay */}
      {!hideSidebar && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {!hideSidebar && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-[var(--color-surface-bg)] border-r border-[var(--color-surface-border)] z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
              >
                <FiX className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
              {sidebarContent}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Desktop Sidebar */}
      {!hideSidebar && (
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 280 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="hidden lg:flex fixed left-0 top-0 bottom-0 bg-[var(--color-surface-bg)] border-r border-[var(--color-surface-border)] z-40 flex-col"
        >
          {sidebarContent}
        </motion.aside>
      )}

      {/* Main Content */}
      <div
        className={`min-h-screen ${!hideSidebar ? (sidebarCollapsed ? "lg:ml-20" : "lg:ml-[280px]") : ""}`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-bg)]/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              {!hideSidebar && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiMenu className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </button>
              )}

              {/* Title */}
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-[var(--color-text-primary)]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-[var(--color-text-secondary)] hidden sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`p-4 lg:p-8 ${contentClassName}`}>{children}</main>
      </div>
    </div>
  );
}
