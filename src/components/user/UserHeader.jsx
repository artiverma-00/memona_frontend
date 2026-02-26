import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiX,
  FiSettings,
  FiPlus,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { memoriesAPI } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const NOTIFICATION_LAST_SEEN_KEY = "memona.notifications.lastSeenAt";

const isSharedMemory = (memory) => {
  if (!memory || typeof memory !== "object") {
    return false;
  }

  const sharedWith =
    memory.sharedWith || memory.shared_with || memory.shared_users || [];
  if (Array.isArray(sharedWith) && sharedWith.length > 0) {
    return true;
  }

  const sharedFlag =
    memory.is_shared ??
    memory.isShared ??
    memory.shared ??
    memory.is_public_share;

  if (typeof sharedFlag === "boolean") {
    return sharedFlag;
  }

  if (typeof sharedFlag === "string") {
    return sharedFlag.toLowerCase() === "true";
  }

  return false;
};

const UserHeader = ({ onMobileMenuToggle }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [lastSeenAt, setLastSeenAt] = useState(() => {
    return localStorage.getItem(NOTIFICATION_LAST_SEEN_KEY) || null;
  });
  const { user } = useAuth();
  const location = useLocation();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await memoriesAPI.getAll({ shared: true });
      const payload = response?.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.memories || [];

      const nextItems = list
        .filter(isSharedMemory)
        .map((memory) => {
          const createdAt = memory.created_at || memory.date || null;
          const memoryId = memory._id || memory.id;
          return {
            id: String(memoryId || Math.random()),
            title: memory.title || "Memory shared with you",
            createdAt,
            href: memoryId ? `/memory/${memoryId}` : "/shared",
          };
        })
        .sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });

      setNotificationItems(nextItems);
    } catch {
      setNotificationItems([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notificationItems.filter((item) => {
    if (!item.createdAt) {
      return false;
    }

    if (!lastSeenAt) {
      return true;
    }

    return new Date(item.createdAt).getTime() > new Date(lastSeenAt).getTime();
  }).length;

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/photos":
        return "Gallery";
      case "/timeline":
        return "Timeline";
      case "/albums":
        return "Albums";
      case "/milestones":
        return "Milestones";
      case "/map":
        return "Memory Map";
      case "/voice-reflections":
        return "Voice Recording";
      case "/search":
        return "Search Memories";
      case "/shared":
        return "Shared Memories";
      case "/settings":
        return "Settings";
      default:
        return "Memona";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-border)]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-page-bg)] transition-colors"
          >
            <FiMenu className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>

          {/* Page Title */}
          <h1 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] truncate max-w-[120px] sm:max-w-none">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:block">
            <div className="search-input">
              <FiSearch className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64"
              />
            </div>
          </div>

          <Link
            to="/photos"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500 text-stone-900 text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            Memories
          </Link>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-page-bg)] transition-colors"
          >
            {searchOpen ? (
              <FiX className="w-5 h-5 text-[var(--color-text-secondary)]" />
            ) : (
              <FiSearch className="w-5 h-5 text-[var(--color-text-secondary)]" />
            )}
          </button>

          <Link
            to="/photos"
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-stone-900 text-sm font-semibold hover:bg-amber-600 transition-colors"
            aria-label=" Memories"
          >
            Memories
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                const nextOpen = !showNotifications;
                setShowNotifications(nextOpen);

                if (nextOpen) {
                  const nowIso = new Date().toISOString();
                  setLastSeenAt(nowIso);
                  localStorage.setItem(NOTIFICATION_LAST_SEEN_KEY, nowIso);
                }
              }}
              className="relative p-2 rounded-lg hover:bg-[var(--color-page-bg)] transition-colors"
            >
              <FiBell className="w-5 h-5 text-[var(--color-text-secondary)]" />
              {unreadCount > 0 ? (
                <span className="notification-badge">{unreadCount}</span>
              ) : null}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] shadow-lg"
                >
                  <div className="border-b border-[var(--color-surface-border)] px-4 py-3">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Notifications
                    </h3>
                  </div>

                  {notificationItems.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-stone-500">
                      No new notifications.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notificationItems.slice(0, 8).map((item) => (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={() => setShowNotifications(false)}
                          className="block border-b border-[var(--color-surface-border)] px-4 py-3 hover:bg-[var(--color-page-bg)]"
                        >
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            {item.createdAt
                              ? formatDate(item.createdAt, "relative")
                              : "Recently"}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="px-4 py-3">
                    <Link
                      to="/shared"
                      onClick={() => setShowNotifications(false)}
                      className="block w-full rounded-lg bg-amber-50 px-3 py-2 text-center text-sm font-medium text-amber-700 hover:bg-amber-100"
                    >
                      View Shared Memories
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--color-page-bg)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
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
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] shadow-lg"
                >
                  <div className="border-b border-[var(--color-surface-border)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {user?.name || user?.username || "User"}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)]"
                    >
                      <FiSettings className="w-4 h-4 text-[var(--color-text-secondary)]" />
                      Settings
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden px-4 pb-4"
          >
            <div className="search-input">
              <FiSearch className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default UserHeader;
