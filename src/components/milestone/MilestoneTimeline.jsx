import MilestoneCard from "./MilestoneCard";

export default function MilestoneTimeline({
  milestones = [],
  loading,
  onCardClick,
  onOpenMemory,
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-100 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading your milestones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line - visible on desktop */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gold-200 via-gold-300 to-gold-200" />

      {/* Timeline items */}
      <div className="space-y-12 md:space-y-16">
        {milestones.map((milestone, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={milestone._id}
              className={`flex items-center ${
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Desktop alternating spacing */}
              <div className="hidden md:block md:w-1/2" />

              {/* Central dot */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10 items-center justify-center">
                <div className="relative w-5 h-5">
                  {/* Pulsing circle background */}
                  <div className="absolute inset-0 bg-gold-300 rounded-full animate-pulse-gold" />

                  {/* Main dot */}
                  <div className="absolute inset-1 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full shadow-lg" />

                  {/* Inner light */}
                  <div className="absolute inset-2.5 bg-white rounded-full opacity-60" />
                </div>
              </div>

              {/* Mobile indicators */}
              <div className="flex md:hidden absolute left-0 items-center gap-3">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 bg-gold-400 rounded-full animate-pulse-gold" />
                  <div className="absolute inset-1 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full" />
                </div>
                <div className="w-0.5 h-full bg-gold-200" />
              </div>

              {/* Card */}
              <div
                className={`w-full md:w-1/2 ${isEven ? "md:pr-8" : "md:pl-8"} animate-fade-in-up`}
              >
                <MilestoneCard
                  milestone={milestone}
                  onCardClick={onCardClick}
                  onOpenMemory={onOpenMemory}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline end marker */}
      <div className="mt-16 flex items-center gap-3 md:justify-center">
        <div className="hidden md:block w-1/2" />
        <div className="relative w-4 h-4 md:w-5 md:h-5">
          <div className="absolute inset-0 bg-gold-300 rounded-full animate-pulse-gold" />
          <div className="absolute inset-1 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full" />
        </div>
        <div className="md:hidden w-0" />
      </div>

      {/* Timeline end text */}
      <p className="text-center text-gray-500 text-sm mt-6 font-light">
        End of timeline
      </p>
    </div>
  );
}
