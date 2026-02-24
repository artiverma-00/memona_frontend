import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function UpcomingAnniversaryCard({ milestone }) {
  const [isHovered, setIsHovered] = useState(false);

  const calculateYearsAgo = (date) => {
    if (!date) return 0;
    const targetDate = new Date(date);
    const today = new Date();
    return today.getFullYear() - targetDate.getFullYear();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const yearsAgo = calculateYearsAgo(milestone.celebration_date);

  return (
    <div
      className="premium-upcoming-card group animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-gradient-to-br from-amber-50 to-amber-25 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100">
        {/* Left gold border accent */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-gold-400 to-gold-300" />

        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail Image */}
          {milestone.memory_thumbnail && (
            <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-100">
              <img
                src={milestone.memory_thumbnail}
                alt={milestone.memory_title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/5" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Years badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full">
                  {yearsAgo} {yearsAgo === 1 ? 'Year' : 'Years'} Ago
                </span>
                {milestone.reminder_enabled && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    Today
                  </span>
                )}
              </div>

              {/* Main text */}
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">
                {milestone.memory_title}
              </h2>

              {/* Description or date */}
              <p className="text-gray-600 text-base sm:text-lg">
                Today marks {yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} since this special moment.
              </p>

              {/* Date */}
              <p className="text-sm text-gray-500 mt-3">
                {formatDate(milestone.celebration_date)}
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-6 sm:mt-8">
              <button
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isHovered
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'bg-gold-400 text-white hover:bg-gold-500'
                }`}
              >
                View Memory
                <ChevronRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Light pulse animation */}
        <div className="absolute inset-0 pointer-events-none bg-white opacity-0 group-hover:animate-pulse-light" />
      </div>
    </div>
  );
}
