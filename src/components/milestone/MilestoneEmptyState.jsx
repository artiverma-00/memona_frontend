import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MilestoneEmptyState({ loading }) {
  const navigate = useNavigate();

  if (loading) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-24 px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        {/* Decorative icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <div className="absolute inset-0 border-2 border-gold-200 rounded-full animate-spin-slow" />

            {/* Middle ring */}
            <div className="absolute inset-2 border border-gold-100 rounded-full animate-spin-reverse-slow" />

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-gold-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-3">
          No Milestones Yet
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-base mb-6 font-light leading-relaxed">
          Create your first milestone by selecting a special memory and marking
          it as a celebration. Watch as your story unfolds through important
          moments.
        </p>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300" />
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Get Started
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300" />
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/memories")}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-medium rounded-lg hover:from-gold-500 hover:to-gold-600 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
        >
          <Plus
            size={20}
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <span>Create Your First Milestone</span>
        </button>

        {/* Additional help text */}
        <p className="text-xs text-gray-500 mt-6 font-light">
          Go to your memories and mark special moments as milestones
        </p>
      </div>
    </div>
  );
}
