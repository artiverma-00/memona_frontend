import { Heart, Sparkles, Calendar, Trophy } from "lucide-react";

export default function MilestoneStats({ milestones = [] }) {
  const totalMilestones = milestones.length;

  // Calculate milestones with reminders
  const withReminders = milestones.filter((m) => m.reminder_enabled).length;

  // Calculate most recent milestone
  const mostRecentMilestone =
    milestones.length > 0
      ? new Date(
          Math.max(
            ...milestones.map((m) => new Date(m.celebration_date).getTime()),
          ),
        )
      : null;

  // Calculate total celebrated years
  const totalYears = milestones.reduce((sum, milestone) => {
    const targetDate = new Date(milestone.celebration_date);
    const today = new Date();
    return sum + (today.getFullYear() - targetDate.getFullYear());
  }, 0);

  const statCards = [
    {
      icon: Heart,
      label: "Milestones Celebrated",
      value: totalMilestones,
      color: "from-rose-500 to-rose-400",
      bgColor: "from-rose-50 to-rose-25",
      description: "Cherished moments in your story",
    },
    {
      icon: Sparkles,
      label: "With Reminders",
      value: withReminders,
      color: "from-gold-500 to-gold-400",
      bgColor: "from-gold-50 to-amber-25",
      description: "Never miss a celebration",
    },
    {
      icon: Calendar,
      label: "Years Celebrated",
      value: totalYears,
      color: "from-blue-500 to-blue-400",
      bgColor: "from-blue-50 to-blue-25",
      description: "Time together celebrated",
    },
    {
      icon: Trophy,
      label: "Story Strength",
      value: `${Math.round((withReminders / Math.max(totalMilestones, 1)) * 100)}%`,
      color: "from-amber-500 to-amber-400",
      bgColor: "from-amber-50 to-amber-25",
      description: "Milestone engagement rate",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`group bg-gradient-to-br ${card.bgColor} rounded-2xl p-6 border border-yellow-100 hover:border-gold-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Icon background */}
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon size={24} />
            </div>

            {/* Label */}
            <p className="text-sm font-medium text-gray-600 mb-1">
              {card.label}
            </p>

            {/* Value */}
            <p
              className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-2`}
            >
              {card.value}
            </p>

            {/* Description */}
            <p className="text-xs text-gray-500 font-light">
              {card.description}
            </p>

            {/* Hover accent */}
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-gold-400 to-gold-500 group-hover:w-full transition-all duration-300 rounded-full" />
          </div>
        );
      })}
    </div>
  );
}
