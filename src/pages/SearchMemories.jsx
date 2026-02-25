import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiCalendar,
  FiTag,
  FiChevronDown,
} from "react-icons/fi";
import { useMemory } from "../context/MemoryContext";
import MemoryCard from "../components/memory/MemoryCard";
import Loader from "../components/shared/Loader";
import SearchBar from "../components/shared/SearchBar";
import {
  advancedSearch,
  extractUniqueTags,
  getMemoryDateRange,
  groupResultsByDate,
} from "../utils/searchUtils";
import { formatDate } from "../utils/formatDate";

const SearchMemories = () => {
  const { memories, loading } = useMemory();

  // Search state
  const [keywords, setKeywords] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedYear, setExpandedYear] = useState(null);

  // Get available tags and date range
  const availableTags = useMemo(() => extractUniqueTags(memories), [memories]);
  const dateRange = useMemo(() => getMemoryDateRange(memories), [memories]);

  // Perform advanced search
  const searchResults = useMemo(() => {
    return advancedSearch(memories, {
      keywords,
      tags: selectedTags,
      startDate,
      endDate,
    });
  }, [memories, keywords, selectedTags, startDate, endDate]);

  // Group results by date
  const groupedResults = useMemo(
    () => groupResultsByDate(searchResults),
    [searchResults],
  );

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleClearFilters = () => {
    setKeywords("");
    setSelectedTags([]);
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
  };

  const hasActiveFilters =
    keywords || selectedTags.length > 0 || startDate || endDate;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading memories..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Search Memories</h1>
        <p className="text-stone-500">
          Find your memories by keywords, tags, or dates
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search memories by title, description..."
              onSearch={setKeywords}
              showFilterButton={true}
              filtersActive={showFilters}
              onFilterClick={() => setShowFilters(!showFilters)}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
            <FiFilter className="w-4 h-4 text-amber-600 mr-1" />

            {/* Keyword Badge */}
            {keywords && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-sm border border-amber-200 shadow-sm text-stone-700">
                <span className="font-medium">{keywords}</span>
                <button
                  onClick={() => setKeywords("")}
                  className="hover:text-amber-600 transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tag Badges */}
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-sm border border-amber-200 shadow-sm text-stone-700"
              >
                <FiTag className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium">#{tag}</span>
                <button
                  onClick={() => handleToggleTag(tag)}
                  className="hover:text-amber-600 transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Date Range Badge */}
            {(startDate || endDate) && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-sm border border-amber-200 shadow-sm text-stone-700">
                <FiCalendar className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium">
                  {startDate && formatDate(startDate)}
                  {startDate && endDate && " → "}
                  {endDate && formatDate(endDate)}
                </span>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="hover:text-amber-600 transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Clear All Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="ml-auto text-sm text-amber-600 hover:text-amber-700 font-bold px-3 py-1 hover:bg-amber-100 rounded-lg transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 bg-white border border-stone-100 rounded-3xl shadow-xl shadow-stone-200/50 space-y-8"
          >
            {/* Tag Filter */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FiTag className="text-amber-600 w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900">
                  Filter by Tags
                  <span className="ml-2 text-sm font-normal text-stone-400">
                    ({selectedTags.length} selected)
                  </span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        selectedTags.includes(tag)
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-200 shadow-sm"
                          : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-100"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))
                ) : (
                  <p className="text-stone-400 text-sm italic">
                    No tags available to filter
                  </p>
                )}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FiCalendar className="text-amber-600 w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900">
                  Filter by Date Range
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/5 outline-none text-stone-800 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/5 outline-none text-stone-800 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      {searchResults.length > 0 ? (
        <div className="space-y-8">
          <div className="text-sm text-stone-600">
            Found{" "}
            <span className="font-semibold text-stone-900">
              {searchResults.length}
            </span>{" "}
            memory/memories
            {hasActiveFilters && " matching your filters"}
          </div>

          {Object.entries(groupedResults)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([yearMonth, monthMemories]) => {
              const [year, month] = yearMonth.split("-");
              const monthDate = new Date(year, parseInt(month) - 1);
              const monthName = monthDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });
              const isExpanded = expandedYear === yearMonth;

              return (
                <div key={yearMonth}>
                  <button
                    onClick={() =>
                      setExpandedYear(isExpanded ? null : yearMonth)
                    }
                    className="flex items-center gap-3 mb-4 text-lg font-semibold text-stone-900 hover:text-indigo-600 transition-colors"
                  >
                    <FiChevronDown
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                    {monthName}
                    <span className="text-sm text-stone-500">
                      ({monthMemories.length})
                    </span>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {monthMemories.map((memory) => (
                        <MemoryCard key={memory._id} memory={memory} />
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            No memories found
          </h3>
          <p className="text-stone-500">
            {hasActiveFilters
              ? "Try adjusting your search filters"
              : "Start searching by keywords, tags, or dates"}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchMemories;
