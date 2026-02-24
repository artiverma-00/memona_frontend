import { useEffect, useState } from "react";
import { Heart, Calendar } from "lucide-react";

export default function NextAnniversaryHighlight({ milestone }) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isToday: false,
  });

  useEffect(() => {
    if (!milestone) return;

    const updateCountdown = () => {
      const today = new Date();
      const currentYear = today.getFullYear();

      // Parse celebration date
      const celebrationDate = new Date(milestone.celebration_date);
      let nextAnniversary = new Date(
        currentYear,
        celebrationDate.getMonth(),
        celebrationDate.getDate(),
        0,
        0,
        0,
      );

      // If anniversary already passed this year, calculate for next year
      if (nextAnniversary < today) {
        nextAnniversary = new Date(
          currentYear + 1,
          celebrationDate.getMonth(),
          celebrationDate.getDate(),
          0,
          0,
          0,
        );
      }

      // Check if anniversary is today
      const isToday =
        today.getMonth() === celebrationDate.getMonth() &&
        today.getDate() === celebrationDate.getDate();

      const diff = nextAnniversary - today;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, isToday });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [milestone]);

  const calculateYears = (date) => {
    const today = new Date();
    const target = new Date(date);
    return today.getFullYear() - target.getFullYear();
  };

  if (!milestone) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-50 via-amber-25 to-gold-50 border border-gold-100 shadow-xl animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gold-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold-200 rounded-full blur-3xl opacity-20 -ml-20 -mb-20" />

      <div className="relative z-10 p-8 sm:p-12">
        {countdown.isToday ? (
          /* Today's Anniversary */
          <div className="text-center">
            {/* Celebration badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-full shadow-lg">
              <Heart size={18} className="fill-current animate-pulse" />
              <span className="font-semibold text-sm">Today's Celebration</span>
            </div>

            {/* Main message */}
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
              A Day to Remember
            </h2>

            <p className="text-xl text-gray-700 mb-2">
              {calculateYears(milestone.celebration_date)} beautiful years of
              memories
            </p>

            <p className="text-gray-600 mb-8 font-light">
              {milestone.memory_title}
            </p>

            {/* CTA Button */}
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-xl font-semibold hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1">
              <Heart size={20} />
              Celebrate & Share Memory
            </button>
          </div>
        ) : (
          /* Upcoming Anniversary */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Left side - Info */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white bg-opacity-60 text-gold-700 rounded-full">
                <Calendar size={16} />
                <span className="font-semibold text-sm">Next Anniversary</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-3">
                {milestone.memory_title}
              </h2>

              <p className="text-gray-600 mb-6 font-light">
                {calculateYears(milestone.celebration_date)} years of cherished
                memories
              </p>

              <p className="text-sm text-gray-500 mb-8">
                Celebrate the moment that changed everything
              </p>

              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-lg font-medium hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
                <Heart size={18} />
                View Memory
              </button>
            </div>

            {/* Right side - Countdown */}
            <div className="flex flex-col justify-center">
              <p className="text-gray-600 text-center mb-6 font-light uppercase tracking-wider">
                Coming in...
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Days */}
                <div className="bg-white bg-opacity-80 rounded-2xl p-4 text-center backdrop-blur-sm border border-white border-opacity-50">
                  <div className="text-3xl sm:text-4xl font-bold text-gold-600 mb-2">
                    {countdown.days}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wider">
                    {countdown.days === 1 ? "Day" : "Days"}
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-white bg-opacity-80 rounded-2xl p-4 text-center backdrop-blur-sm border border-white border-opacity-50">
                  <div className="text-3xl sm:text-4xl font-bold text-gold-600 mb-2">
                    {countdown.hours}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wider">
                    {countdown.hours === 1 ? "Hr" : "Hrs"}
                  </div>
                </div>

                {/* Minutes */}
                <div className="bg-white bg-opacity-80 rounded-2xl p-4 text-center backdrop-blur-sm border border-white border-opacity-50">
                  <div className="text-3xl sm:text-4xl font-bold text-gold-600 mb-2">
                    {countdown.minutes}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wider">
                    Min
                  </div>
                </div>

                {/* Seconds */}
                <div className="bg-white bg-opacity-80 rounded-2xl p-4 text-center backdrop-blur-sm border border-white border-opacity-50">
                  <div className="text-3xl sm:text-4xl font-bold text-gold-600 mb-2">
                    {countdown.seconds}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wider">
                    Sec
                  </div>
                </div>
              </div>

              {/* Motivational message */}
              <p className="text-center text-gray-500 text-sm mt-6 font-light italic">
                Every moment with you is a milestone worth celebrating
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Accent border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-50" />
    </div>
  );
}
