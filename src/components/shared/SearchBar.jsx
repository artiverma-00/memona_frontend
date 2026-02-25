import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";
import { debounce } from "../../utils/formatDate";

const SearchBar = ({
  placeholder = "Search memories...",
  onSearch,
  onFilterClick,
  filtersActive = false,
  className = "",
  showFilterButton = false,
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((value) => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300),
  ).current;

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`
          flex items-center gap-3 px-4 py-2.5 
          bg-white
          rounded-2xl border-2 transition-all duration-300
          ${
            isFocused
              ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)] ring-4 ring-amber-500/10"
              : "border-stone-200 hover:border-stone-300"
          }
        `}
      >
        <FiSearch
          className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${isFocused ? "text-amber-600" : "text-stone-500"}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            flex-1 bg-white
            text-stone-800 
            placeholder-stone-400
            outline-none text-sm font-medium
          "
        />

        <div className="flex items-center gap-1.5">
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-all"
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {!query && !isFocused && (
            <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-stone-200 bg-white text-[10px] font-bold text-stone-400 select-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}

          {showFilterButton && <div className="w-px h-5 bg-stone-200 mx-1" />}

          {showFilterButton && (
            <button
              onClick={onFilterClick}
              className={`
                p-2 rounded-xl transition-all duration-300
                ${
                  filtersActive
                    ? "bg-amber-100 text-amber-600 shadow-sm"
                    : "hover:bg-amber-50 text-stone-500 hover:text-amber-600"
                }
              `}
            >
              <FiFilter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Advanced Search with suggestions
export const AdvancedSearch = ({
  suggestions = [],
  onSearch,
  placeholder = "Search memories...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <SearchBar
        placeholder={placeholder}
        onSearch={(value) => {
          setQuery(value);
          onSearch?.(value);
        }}
      />

      <AnimatePresence>
        {showSuggestions && query && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  onSearch?.(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-colors text-sm text-gray-700"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
