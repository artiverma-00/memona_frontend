import { createContext, useContext, useState, useCallback } from "react";
import { albumsAPI, memoriesAPI, milestonesAPI } from "../services/api";

const normalizeMemory = (memory) => {
  if (!memory) {
    return null;
  }

  const normalizedId = memory._id || memory.id || null;
  const locationFromLegacy =
    memory.location ||
    (memory.location_name || memory.location_lat || memory.location_lng
      ? {
          name: memory.location_name || "",
          coordinates:
            memory.location_lat !== null && memory.location_lng !== null
              ? {
                  lat: Number(memory.location_lat),
                  lng: Number(memory.location_lng),
                }
              : null,
        }
      : null);

  let media = memory.media;
  if (!Array.isArray(media)) {
    const relation = memory.media_file || memory.media_files || null;
    const relationItem = Array.isArray(relation) ? relation[0] : relation;
    const mediaUrl =
      memory.media_url ||
      relationItem?.secure_url ||
      memory.media?.secure_url ||
      memory.media?.url ||
      null;
    if (mediaUrl) {
      const mediaType =
        memory.media_type ||
        relationItem?.resource_type ||
        memory.media?.resource_type ||
        memory.media?.type ||
        "image";
      media = [{ type: mediaType, url: mediaUrl }];
    } else {
      media = [];
    }
  }

  return {
    ...memory,
    _id: normalizedId,
    id: normalizedId,
    album_id: memory.album_id || memory.album_memories?.[0]?.album_id || null,
    date: memory.date || memory.created_at || null,
    location: locationFromLegacy,
    media,
    isMilestone:
      memory.isMilestone ?? memory.is_milestone ?? memory.is_milestone === true,
    isPrivate:
      memory.isPrivate ??
      (memory.is_public !== undefined ? !memory.is_public : true),
    isFavorite:
      memory.isFavorite ??
      (memory.is_favorite !== undefined ? memory.is_favorite : false),
  };
};

const normalizeAlbum = (album) => {
  if (!album) {
    return null;
  }

  const normalizedId = album._id || album.id || null;
  const coverRelation = Array.isArray(album.cover_media)
    ? album.cover_media[0]
    : album.cover_media;

  return {
    ...album,
    _id: normalizedId,
    id: normalizedId,
    name: album.name || album.title || "",
    coverImage:
      album.coverImage ||
      album.cover_image_url ||
      coverRelation?.secure_url ||
      null,
    isPrivate:
      album.isPrivate ??
      (album.is_public !== undefined ? !album.is_public : true),
  };
};

const normalizeMilestone = (milestone) => {
  if (!milestone) {
    return null;
  }

  // Extract memory from nested structure (backend returns milestone with memories nested)
  const memoryData = milestone.memories || milestone;
  const normalized = normalizeMemory(memoryData);

  if (!normalized) {
    return null;
  }

  return {
    ...normalized,
    // Milestone-specific fields
    _id: milestone.id || milestone._id || normalized._id,
    id: milestone.id || milestone._id || normalized.id,
    memory_id: milestone.memory_id,
    celebration_date: milestone.celebration_date,
    reminder_enabled: milestone.reminder_enabled ?? true,
    created_at: milestone.created_at,
    updated_at: milestone.updated_at,
    title: milestone.title || normalized.title || normalized.name || "",
    description: milestone.description || "",
    isCompleted: milestone.isCompleted || false,
    // Handle both standalone and memory-linked milestones
    type: milestone.type || "life_event",
    targetDate: milestone.target_date || milestone.targetDate || null,
    targetCount: milestone.target_count ?? milestone.targetCount ?? null,
    reminderOption:
      milestone.reminder_option || milestone.reminderOption || "1_week_before",
    // Flag to distinguish standalone milestones
    is_standalone: milestone.is_standalone || false,
  };
};

const isExplicitlySharedMemory = (memory) => {
  if (!memory || typeof memory !== "object") {
    return false;
  }

  const sharedWith =
    memory.sharedWith || memory.shared_with || memory.shared_users || [];

  if (Array.isArray(sharedWith) && sharedWith.length > 0) {
    return true;
  }

  const sharedFlag =
    memory.is_shared ??
    memory.isShared ??
    memory.shared ??
    memory.is_public_share;

  if (typeof sharedFlag === "boolean") {
    return sharedFlag;
  }

  if (typeof sharedFlag === "string") {
    return sharedFlag.toLowerCase() === "true";
  }

  return false;
};

const buildMemoryPayload = (data, file = null) => {
  const selectedFile =
    file ||
    (Array.isArray(data?.media)
      ? data.media.find((item) => item?.file)?.file
      : null);

  const basePayload = {
    title: data.title,
    date: data.date,
  };

  if (data.description) {
    basePayload.description = data.description;
  }

  if (data.location?.name) {
    basePayload.location_name = data.location.name;
  }

  if (data.location?.coordinates?.lat !== undefined) {
    basePayload.location_lat = data.location.coordinates.lat;
  }

  if (data.location?.coordinates?.lng !== undefined) {
    basePayload.location_lng = data.location.coordinates.lng;
  }

  if (data.isPrivate !== undefined) {
    basePayload.is_public = data.isPrivate ? "false" : "true";
  }

  if (data.isMilestone !== undefined) {
    basePayload.is_milestone = data.isMilestone ? "true" : "false";
  }

  if (!selectedFile) {
    return { payload: basePayload, isMultipart: false };
  }

  const formData = new FormData();
  Object.entries(basePayload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  });
  formData.append("file", selectedFile);

  return { payload: formData, isMultipart: true };
};

const buildAlbumPayload = (data) => ({
  title: data.name,
  description: data.description || "",
  is_public: data.isPrivate ? "false" : "true",
});

const buildAlbumRequest = (data) => {
  const payload = buildAlbumPayload(data);
  const coverFile = data?.coverFile || null;

  if (!coverFile) {
    return { payload, isMultipart: false };
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  });
  formData.append("file", coverFile);

  return { payload: formData, isMultipart: true };
};

const buildMilestonePayload = (data) => {
  // Backend supports two modes:
  // 1. From Memory: requires memory_id (UUID), celebration_date, reminder_enabled
  // 2. Standalone: requires title, celebration_date, and optional fields

  // Check if this is a standalone milestone
  // Standalone has title but NO memory_id, OR memory_id is empty/invalid
  const hasValidMemoryId = data.memory_id && data.memory_id.trim() !== "";
  const isStandalone = !hasValidMemoryId && data.title;

  const payload = {};

  if (isStandalone) {
    // Standalone milestone mode - create with full metadata
    if (data.title) {
      payload.title = data.title;
    }
    if (data.description) {
      payload.description = data.description;
    }
    if (data.type) {
      payload.type = data.type;
    }
    // Map date to celebration_date (required)
    if (data.date) {
      payload.celebration_date = data.date;
    }
    // Map targetDate to target_date
    if (data.targetDate) {
      payload.target_date = data.targetDate;
    }
    // Map targetCount to target_count
    if (data.targetCount !== undefined && data.targetCount !== null) {
      payload.target_count = data.targetCount;
    }
    // Map reminderOption to reminder_option
    if (data.reminderOption) {
      payload.reminder_option = data.reminderOption;
    }
    // Always enable reminders for standalone milestones by default
    if (data.reminder_enabled !== undefined) {
      payload.reminder_enabled = data.reminder_enabled;
    } else {
      payload.reminder_enabled = true;
    }
  } else {
    // From Memory mode (original behavior)
    if (hasValidMemoryId) {
      payload.memory_id = data.memory_id;
    }
    if (data.celebration_date) {
      payload.celebration_date = data.celebration_date;
    }
    if (data.reminder_enabled !== undefined) {
      payload.reminder_enabled = data.reminder_enabled;
    }
  }

  // For update operations, allow partial updates
  if (Object.keys(payload).length === 0) {
    throw new Error("At least one field is required for milestone");
  }

  return payload;
};

const MemoryContext = createContext(null);

export const useMemoryContext = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error("useMemoryContext must be used within a MemoryProvider");
  }
  return context;
};

export const useMemory = useMemoryContext;

export const MemoryProvider = ({ children }) => {
  const [memories, setMemories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [sharedMemories, setSharedMemories] = useState([]);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchMemories = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.getAll(params);

      if (response.data.success) {
        const payload = response.data.data;
        const list = Array.isArray(payload) ? payload : payload?.memories || [];
        setMemories(list.map(normalizeMemory).filter(Boolean));
        if (payload?.pagination) {
          setPagination(payload.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch memories");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMemory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.getById(id);

      if (response.data.success) {
        const memory = normalizeMemory(
          response.data.data?.memory || response.data.data,
        );
        setCurrentMemory(memory);
        return memory;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch memory");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMemory = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const files = Array.isArray(data?.media)
        ? data.media
            .map((item) => item?.file)
            .filter((item) => item instanceof File)
        : [];

      if (files.length <= 1) {
        const { payload, isMultipart } = buildMemoryPayload(data);
        const response = isMultipart
          ? await memoriesAPI.createWithFile(payload)
          : await memoriesAPI.create(payload);

        if (response.data.success) {
          const memory = normalizeMemory(
            response.data.data?.memory || response.data.data,
          );
          if (memory) {
            setMemories((prev) => [memory, ...prev]);
          }
          return {
            success: true,
            memory,
            memories: memory ? [memory] : [],
            count: memory ? 1 : 0,
          };
        }
      }

      const createdMemories = [];
      for (const file of files) {
        const { payload } = buildMemoryPayload(data, file);
        const response = await memoriesAPI.createWithFile(payload);
        if (!response.data?.success) {
          throw new Error("Failed to create memory");
        }
        const memory = normalizeMemory(
          response.data.data?.memory || response.data.data,
        );
        if (memory) {
          createdMemories.push(memory);
        }
      }

      if (createdMemories.length > 0) {
        setMemories((prev) => [...createdMemories.reverse(), ...prev]);
      }
      return {
        success: true,
        memory: createdMemories[0] || null,
        memories: createdMemories,
        count: createdMemories.length,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create memory";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateMemory = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.update(id, data);

      if (response.data.success) {
        const updatedMemory = normalizeMemory(
          response.data.data?.memory || response.data.data,
        );
        if (updatedMemory) {
          setMemories((prev) =>
            prev.map((m) => (m._id === id ? updatedMemory : m)),
          );
          if (currentMemory?._id === id) {
            setCurrentMemory(updatedMemory);
          }
        }
        return { success: true, memory: updatedMemory };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update memory";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.delete(id);

      if (response.data.success) {
        setMemories((prev) => prev.filter((m) => m._id !== id));
        if (currentMemory?._id === id) {
          setCurrentMemory(null);
        }
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete memory";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const memory = memories.find((item) => item._id === id);
      const shouldLike = !memory?.isFavorite;
      const response = shouldLike
        ? await memoriesAPI.like(id)
        : await memoriesAPI.unlike(id);

      if (response.data.success) {
        setMemories((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, isFavorite: response.data.data.liked } : m,
          ),
        );
        return { success: true, isFavorite: response.data.data.liked };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const fetchMapLocations = useCallback(async () => {
    try {
      const response = await memoriesAPI.getMapLocations();
      if (response.data.success) {
        return response.data.data.memories;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch map locations:", err);
      return [];
    }
  }, []);

  const fetchTimeline = useCallback(async (year) => {
    try {
      const response = await memoriesAPI.getTimeline(year);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
      return null;
    }
  }, []);

  const fetchAlbums = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await albumsAPI.getAll(params);
      if (response.data?.success) {
        const nextAlbums =
          response.data?.data?.albums || response.data?.data || [];
        const normalized = Array.isArray(nextAlbums)
          ? nextAlbums.map(normalizeAlbum).filter(Boolean)
          : [];
        setAlbums(normalized);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch albums");
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlbum = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const { payload, isMultipart } = buildAlbumRequest(data);
      const response = isMultipart
        ? await albumsAPI.createWithFile(payload)
        : await albumsAPI.create(payload);
      if (response.data?.success) {
        const album = normalizeAlbum(
          response.data?.data?.album || response.data?.data,
        );
        if (album) {
          setAlbums((prev) => [album, ...prev]);
        }
        return { success: true, album };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create album";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateAlbum = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const { payload, isMultipart } = buildAlbumRequest(data);
      const response = isMultipart
        ? await albumsAPI.updateWithFile(id, payload)
        : await albumsAPI.update(id, payload);
      if (response.data?.success) {
        const updatedAlbum = normalizeAlbum(
          response.data?.data?.album || response.data?.data,
        );
        if (updatedAlbum) {
          setAlbums((prev) =>
            prev.map((a) => (a._id === id ? updatedAlbum : a)),
          );
        }
        return { success: true, album: updatedAlbum };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update album";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbum = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await albumsAPI.delete(id);
      if (response.data?.success) {
        setAlbums((prev) => prev.filter((a) => a._id !== id));
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete album";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await milestonesAPI.getAll(params);
      if (response.data?.success) {
        const nextMilestones =
          response.data?.data?.milestones || response.data?.data || [];
        const normalized = Array.isArray(nextMilestones)
          ? nextMilestones.map(normalizeMilestone).filter(Boolean)
          : [];
        setMilestones(normalized);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch milestones");
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMilestone = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await milestonesAPI.create(buildMilestonePayload(data));
      if (response.data?.success) {
        const milestone = normalizeMilestone(response.data?.data);
        if (milestone) {
          setMilestones((prev) => [milestone, ...prev]);
        }
        return { success: true, milestone };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create milestone";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await milestonesAPI.update(
        id,
        buildMilestonePayload(data),
      );
      if (response.data?.success) {
        const updatedMilestone = normalizeMilestone(response.data?.data);
        if (updatedMilestone) {
          setMilestones((prev) =>
            prev.map((m) => (m._id === id ? updatedMilestone : m)),
          );
        }
        return { success: true, milestone: updatedMilestone };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update milestone";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await milestonesAPI.delete(id);
      if (response.data?.success) {
        setMilestones((prev) => prev.filter((m) => m._id !== id));
        return { success: true };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete milestone";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayReminders = useCallback(async () => {
    try {
      const response = await milestonesAPI.getTodayReminders();
      if (response.data?.success) {
        const todayReminders =
          response.data?.data?.todayReminders || response.data?.data || [];
        const normalized = Array.isArray(todayReminders)
          ? todayReminders.map(normalizeMilestone).filter(Boolean)
          : [];
        return { success: true, data: normalized };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch today's reminders";
      console.error(message);
      return { success: false, error: message, data: [] };
    }
  }, []);

  const fetchSharedMemories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.getAll({ shared: true });
      if (response.data?.success) {
        const nextShared =
          response.data?.data?.memories || response.data?.data || [];
        const normalizedShared = Array.isArray(nextShared)
          ? nextShared.map(normalizeMemory).filter(Boolean)
          : [];

        setSharedMemories(
          normalizedShared.filter((memory) => isExplicitlySharedMemory(memory)),
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch shared memories",
      );
      setSharedMemories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    memories,
    albums,
    milestones,
    sharedMemories,
    currentMemory,
    loading,
    error,
    pagination,
    fetchMemories,
    fetchMemory,
    createMemory,
    updateMemory,
    deleteMemory,
    toggleFavorite,
    fetchMapLocations,
    fetchTimeline,
    fetchAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    fetchTodayReminders,
    fetchSharedMemories,
    setCurrentMemory,
  };

  return (
    <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>
  );
};

export default MemoryContext;
