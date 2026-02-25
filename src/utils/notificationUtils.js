/**
 * Notification utilities for milestone reminders and reflections
 * 
 * Note: For delete confirmations, use the ConfirmToast component
 * import { confirmDelete } from "../components/shared/ConfirmToast";
 */

import { toast } from "react-toastify";

/**
 * Show milestone reminder notification
 */
export const showMilestoneReminder = (milestone) => {
  const icon = "🎉";
  toast.info(`Reminder: ${milestone.title} is coming up! 🎁`, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show reflection prompt notification
 */
export const showReflectionPrompt = (milestone, prompt, onAccept) => {
  toast.info(`💭 Reflect on "${milestone.title}": ${prompt}`, {
    position: "top-right",
    autoClose: 7000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClick: onAccept,
  });
};

/**
 * Show milestone completed notification
 */
export const showMilestoneCompleted = (milestone) => {
  toast.success(`🎊 Congratulations on "${milestone.title}"!`, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show anniversary notification
 */
export const showAnniversary = (milestone, yearsAgo) => {
  toast.success(
    `Happy ${yearsAgo}-year anniversary of "${milestone.title}"! 🎉`,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    },
  );
};

/**
 * Show milestone created notification
 */
export const showMilestoneCreated = (milestone) => {
  toast.success(`✨ Milestone "${milestone.title}" created!`, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show milestone updated notification
 */
export const showMilestoneUpdated = (milestone) => {
  toast.info(`✏️ Milestone "${milestone.title}" updated!`, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show milestone deleted notification
 */
export const showMilestoneDeleted = (milestone) => {
  toast.warning(`🗑️ Milestone "${milestone.title}" deleted.`, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Browser notification (if supported)
 */
export const showBrowserNotification = (title, options = {}) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      icon: "/memona-icon.png",
      ...options,
    });
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }
  return false;
};

/**
 * Get upcoming reminders
 */
export const getUpcomingReminders = (milestones, daysAhead = 30) => {
  const today = new Date();
  const futureDate = new Date(
    today.getTime() + daysAhead * 24 * 60 * 60 * 1000,
  );

  return milestones.filter((milestone) => {
    const milestoneDate = new Date(milestone.date);
    return milestoneDate >= today && milestoneDate <= futureDate;
  });
};

/**
 * Get past anniversaries
 */
export const getPastAnniversaries = (milestone) => {
  const milestoneYear = new Date(milestone.date).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsPassed = currentYear - milestoneYear;

  return yearsPassed > 0 ? yearsPassed : null;
};

/**
 * Check if milestone is upcoming (within next 7 days)
 */
export const isUpcoming = (milestoneDate) => {
  const today = new Date();
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const date = new Date(milestoneDate);
  return date >= today && date <= sevenDaysLater;
};

/**
 * Check if milestone is today
 */
export const isToday = (milestoneDate) => {
  const today = new Date();
  const date = new Date(milestoneDate);

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

/**
 * Check if milestone is in the past
 */
export const isPast = (milestoneDate) => {
  return new Date(milestoneDate) < new Date();
};

/**
 * Days until milestone
 */
export const daysUntilMilestone = (milestoneDate) => {
  const today = new Date();
  const date = new Date(milestoneDate);

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const difference = date.getTime() - today.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

/**
 * Format days until milestone for display
 */
export const formatDaysUntil = (days) => {
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 7) return "1 week away";
  if (days === 30) return "1 month away";
  return `${days} days away`;
};
