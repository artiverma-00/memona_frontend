/**
 * Format a date string to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {string} format - The format type: 'short', 'long', 'relative', 'time', 'full'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "short") => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diff = Math.abs(now - d);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  switch (format) {
    case "relative":
      // Return relative time
      if (Math.abs(seconds) < 60) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      if (days < 30) return `${Math.floor(days / 7)}w ago`;
      if (days < 365) return `${Math.floor(days / 30)}mo ago`;
      return `${Math.floor(days / 365)}y ago`;

    case "long":
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    case "time":
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    case "full":
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    case "short":
    default:
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  }
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

/**
 * Get time of day greeting
 * @returns {string}
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * Generate a random color
 * @returns {string}
 */
export const generateRandomColor = () => {
  const colors = [
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#14b8a6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Get initials from a name
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Capitalize first letter of each word
 * @param {string} str
 * @returns {string}
 */
export const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
