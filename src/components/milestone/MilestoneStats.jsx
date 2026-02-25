import { Calendar, CheckCircle2, Heart } from "lucide-react";

export default function MilestoneStats({ milestones = [] }) {
  const totalMilestones = milestones.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextAnniversary = milestones.reduce((closest, milestone) => {
    if (!milestone?.celebration_date) {
      return closest;
    }

    const original = new Date(milestone.celebration_date);
    if (Number.isNaN(original.getTime())) {
      return closest;
    }

    let candidate = new Date(
      today.getFullYear(),
      original.getMonth(),
      original.getDate(),
    );
    candidate.setHours(0, 0, 0, 0);

    if (candidate < today) {
      candidate = new Date(
        today.getFullYear() + 1,
        original.getMonth(),
        original.getDate(),
      );
      candidate.setHours(0, 0, 0, 0);
    }

    if (!closest || candidate < closest) {
      return candidate;
    }

    return closest;
  }, null);

  const celebratedThisYear = milestones.filter((milestone) => {
    const sourceDate = new Date(milestone?.celebration_date);
    if (Number.isNaN(sourceDate.getTime())) {
      return false;
    }

    const thisYearAnniversary = new Date(
      today.getFullYear(),
      sourceDate.getMonth(),
      sourceDate.getDate(),
    );
    thisYearAnniversary.setHours(0, 0, 0, 0);

    return thisYearAnniversary <= today;
  }).length;

  const statCards = [
    {
      icon: Heart,
      label: "Total Milestones",
      value: totalMilestones,
      color: "from-rose-500 to-rose-400",
      bgColor: "from-rose-50 to-rose-25",
      description: "Saved moments in your story",
    },
    {
      icon: Calendar,
      label: "Next Anniversary",
      value: nextAnniversary
        ? nextAnniversary.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "—",
      color: "from-blue-500 to-blue-400",
      bgColor: "from-blue-50 to-blue-25",
      description: "Closest upcoming date",
    },
    {
      icon: CheckCircle2,
      label: "Celebrated This Year",
      value: celebratedThisYear,
      color: "from-amber-500 to-amber-400",
      bgColor: "from-amber-50 to-amber-25",
      description: "Anniversaries already reached",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
