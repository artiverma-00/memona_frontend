import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiClock,
  FiImage,
  FiCamera,
  FiMapPin,
  FiStar,
  FiUsers,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useMemory } from "../../context/MemoryContext";
import Modal from "../shared/Modal";

const UserSidebar = ({
  collapsed = false,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { memories = [], fetchMemories } = useMemory();
  const storageLimit = 100;
  const usedStorage = memories.length;
  const usedPercentage = Math.min((usedStorage / storageLimit) * 100, 100);
  const totalStorageGb = 15;
  const remainingStorageGb = Math.max(
    0,
    totalStorageGb - (usedStorage / storageLimit) * totalStorageGb,
  );

  useEffect(() => {
    if (user?.id) {
      fetchMemories();
    }
  }, [user?.id, fetchMemories]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const mainLinks = [
    { path: "/dashboard", label: "Dashboard", icon: FiHome },
    { path: "/timeline", label: "Timeline", icon: FiClock },
    { path: "/photos", label: "Gallery", icon: FiCamera },
    { path: "/albums", label: "Albums", icon: FiImage },
    { path: "/milestones", label: "Milestones", icon: FiStar },
    { path: "/map", label: "Memory Map", icon: FiMapPin },
  ];

  const secondaryLinks = [
    { path: "/shared", label: "Shared Memories", icon: FiUsers },
    { path: "/support", label: "Support", icon: FiHelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link
        to="/"
        className="p-6 flex items-center gap-3 cursor-pointer hover:opacity-90"
        onClick={onMobileClose}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xl">M</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="text-xl font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                Memona
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] block -mt-1">
                MemoryLane
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-stone-200 rounded-full items-center justify-center shadow-sm hover:bg-stone-100 transition-colors z-10"
      >
        {collapsed ? (
          <FiChevronRight className="w-4 h-4 text-stone-500" />
        ) : (
          <FiChevronLeft className="w-4 h-4 text-stone-500" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {/* Main Links */}
        <div className="mb-4">
          <AnimatePresence>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400"
              >
                Main
              </motion.p>
            )}
          </AnimatePresence>

          {mainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onMobileClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative
                ${
                  isActive(link.path)
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }
              `}
            >
              {isActive(link.path) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-amber-500 rounded-r-full"
                />
              )}
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>

        {/* Secondary Links */}
        <div className="mb-4">
          <AnimatePresence>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400"
              >
                Social
              </motion.p>
            )}
          </AnimatePresence>

          {secondaryLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onMobileClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200
                ${
                  isActive(link.path)
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }
              `}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-[var(--color-surface-border)]">
        {/* User Profile */}
        <div
          className={`
          flex items-center gap-3 p-3 rounded-xl mb-2
          ${collapsed ? "justify-center" : "bg-[var(--color-page-bg)]"}
        `}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {user?.name || user?.username || "User"}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-red-600 transition-colors"
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="py-4 text-center">
          <p className="text-stone-600 mb-6">
            Are you sure you want to logout?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      {/* Stats Card */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-white">
              <p className="text-xs opacity-80 mb-1">Storage Used</p>
              <p className="text-2xl font-bold">
                {usedStorage} / {storageLimit}
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>
              <p className="text-xs opacity-90 mt-2">
                {remainingStorageGb.toFixed(1)}GB remaining
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 bg-[var(--color-surface-bg)] border-r border-[var(--color-surface-border)] z-40 flex-col"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-[var(--color-surface-bg)] border-r border-[var(--color-surface-border)] z-50 lg:hidden flex flex-col"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserSidebar;
