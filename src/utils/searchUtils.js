/**
 * Advanced search utilities for memories
 * Supports searching by keywords, tags, and dates
 */

/**
 * Normalize text for case-insensitive searching
 */
const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

/**
 * Search memories by keywords (title, description, location)
 */
export const searchByKeywords = (memories, query) => {
  if (!query || !query.trim()) return memories;

  const lowerQuery = normalizeText(query);

  return memories.filter((memory) => {
    const titleMatch = normalizeText(memory.title).includes(lowerQuery);
    const descMatch = normalizeText(memory.description).includes(lowerQuery);
    const locationMatch = normalizeText(memory.location?.name).includes(
      lowerQuery,
    );

    return titleMatch || descMatch || locationMatch;
  });
};

/**
 * Search memories by tags
 */
export const searchByTags = (memories, tags) => {
  if (!tags || tags.length === 0) return memories;

  const normalizeTags = tags.map(normalizeText);

  return memories.filter((memory) => {
    if (!Array.isArray(memory.tags)) return false;

    return memory.tags.some((tag) =>
      normalizeTags.includes(normalizeText(tag)),
    );
  });
};

/**
 * Search memories by date range
 */
export const searchByDateRange = (memories, startDate, endDate) => {
  if (!startDate && !endDate) return memories;

  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  // Set end date to end of day if only start is provided
  if (start && !end) end = new Date(start);
  if (end) end.setHours(23, 59, 59, 999);

  return memories.filter((memory) => {
    if (!memory.date) return false;

    const memoryDate = new Date(memory.date);

    if (start && memoryDate < start) return false;
    if (end && memoryDate > end) return false;

    return true;
  });
};

/**
 * Search memories by specific date
 */
export const searchByDate = (memories, date) => {
  if (!date) return memories;

  const searchDate = new Date(date);
  searchDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(searchDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return memories.filter((memory) => {
    if (!memory.date) return false;

    const memoryDate = new Date(memory.date);
    memoryDate.setHours(0, 0, 0, 0);

    return memoryDate.getTime() === searchDate.getTime();
  });
};

/**
 * Combined advanced search
 * Search by keywords AND filter by tags AND filter by date range
 */
export const advancedSearch = (memories, filters = {}) => {
  const {
    keywords = "",
    tags = [],
    startDate = null,
    endDate = null,
  } = filters;

  let results = memories;

  // Apply keyword search
  if (keywords.trim()) {
    results = searchByKeywords(results, keywords);
  }

  // Apply tag filters
  if (tags.length > 0) {
    results = searchByTags(results, tags);
  }

  // Apply date range filter
  if (startDate || endDate) {
    results = searchByDateRange(results, startDate, endDate);
  }

  return results;
};

/**
 * Get unique tags from memories
 */
export const extractUniqueTags = (memories) => {
  const tagSet = new Set();

  memories.forEach((memory) => {
    if (Array.isArray(memory.tags)) {
      memory.tags.forEach((tag) => {
        if (tag && tag.trim()) {
          tagSet.add(normalizeText(tag));
        }
      });
    }
  });

  return Array.from(tagSet).sort();
};

/**
 * Get year range from memories for date filtering
 */
export const getMemoryDateRange = (memories) => {
  if (memories.length === 0) {
    return {
      minYear: new Date().getFullYear(),
      maxYear: new Date().getFullYear(),
    };
  }

  const dates = memories
    .filter((m) => m.date)
    .map((m) => new Date(m.date).getFullYear());

  return {
    minYear: Math.min(...dates),
    maxYear: Math.max(...dates),
  };
};

/**
 * Group search results by date for display
 */
export const groupResultsByDate = (memories) => {
  const grouped = {};

  memories.forEach((memory) => {
    if (!memory.date) return;

    const date = new Date(memory.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(memory);
  });

  return grouped;
};
