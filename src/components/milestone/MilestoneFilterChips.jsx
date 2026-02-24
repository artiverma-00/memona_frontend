import { X } from "lucide-react";
import { useState } from "react";

export default function MilestoneFilterChips({ onFilterChange }) {
  const [activeFilters, setActiveFilters] = useState([]);

  const categories = [
    { id: "anniversary", label: "Anniversary", emoji: "💍" },
    { id: "birthday", label: "Birthday", emoji: "🎂" },
    { id: "milestone", label: "Life Milestone", emoji: "🏆" },
    { id: "travel", label: "Travel", emoji: "✈️" },
    { id: "achievement", label: "Achievement", emoji: "⭐" },
    { id: "memory", label: "Special Memory", emoji: "💝" },
    { id: "family", label: "Family Event", emoji: "👨‍👩‍👧‍👦" },
    { id: "celebration", label: "Celebration", emoji: "🎉" },
  ];

  const toggleFilter = (filterId) => {
    let newFilters;
    if (activeFilters.includes(filterId)) {
      newFilters = activeFilters.filter((f) => f !== filterId);
    } else {
      newFilters = [...activeFilters, filterId];
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onFilterChange([]);
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Explore by Type
          </h3>
          <p className="text-sm text-gray-600 font-light">
            Filter your milestones by category
          </p>
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isActive = activeFilters.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => toggleFilter(category.id)}
              className={`
                px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300
                flex items-center gap-2
                ${
                  isActive
                    ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-md scale-105"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-gold-400 hover:text-gold-600"
                }
              `}
            >
              <span className="text-lg">{category.emoji}</span>
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="mt-6 p-4 bg-gold-50 border border-gold-100 rounded-xl">
          <p className="text-sm text-gray-700 mb-3">
            Showing milestones in:{" "}
            <span className="font-semibold">
              {activeFilters
                .map((id) => categories.find((c) => c.id === id)?.label)
                .join(", ")}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filterId) => {
              const category = categories.find((c) => c.id === filterId);
              return (
                <div
                  key={filterId}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gold-200"
                >
                  <span className="text-sm font-medium text-gold-700">
                    {category.label}
                  </span>
                  <button
                    onClick={() => toggleFilter(filterId)}
                    className="text-gold-400 hover:text-gold-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
