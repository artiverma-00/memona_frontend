export default function MilestoneHeader() {
  return (
    <header className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-96 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-50 to-transparent opacity-40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Accent line above title */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400" />
          <span className="px-4 text-xs sm:text-sm font-semibold text-gold-600 tracking-widest uppercase">
            Your Story
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400" />
        </div>

        {/* Main title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-4 animate-fade-in">
          Milestones
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-600 font-light mb-2 animate-fade-in-delayed">
          Moments that shaped your story.
        </p>

        {/* Decorative description */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="inline-block w-8 h-px bg-gradient-to-r from-transparent to-gray-300" />
          <span>Celebrate the milestones that matter</span>
          <span className="inline-block w-8 h-px bg-gradient-to-l from-transparent to-gray-300" />
        </div>
      </div>
    </header>
  );
}
