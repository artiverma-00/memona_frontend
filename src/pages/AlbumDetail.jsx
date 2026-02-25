import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiImage,
  FiLock,
  FiGlobe,
  FiUpload,
  FiVideo,
  FiMic,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { albumsAPI, memoriesAPI } from "../services/api";
import Loader from "../components/shared/Loader";
import { formatDate } from "../utils/formatDate";

const resolveCoverImage = (album) => {
  if (!album) return null;

  const relation = album.cover_media;
  const relationItem = Array.isArray(relation) ? relation[0] : relation;

  return (
    album.coverImage ||
    album.cover_image_url ||
    relationItem?.secure_url ||
    null
  );
};

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState(null);
  const [albumMedia, setAlbumMedia] = useState([]);
  const [clockTick, setClockTick] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await albumsAPI.getById(id);
        if (response.data?.success) {
          const payload = response.data?.data?.album || response.data?.data;
          setAlbum(payload || null);

          // Standard parsing of memories provided by the server
          const rawMemories = Array.isArray(payload?.memories)
            ? payload.memories
            : [];
          let fetchedMedia = rawMemories
            .flatMap((item) => {
              // item could be a memory object or { memory: {...} } from older join results
              const memory = item.memory || item;
              if (!memory || typeof memory !== "object") return [];

              // If it already has a media array (standardized), use it
              if (Array.isArray(memory.media) && memory.media.length > 0) {
                return memory.media.map((mediaItem, index) => ({
                  id: `${memory._id || memory.id}-${index}`,
                  title: memory.title || "Untitled",
                  type: mediaItem.type || mediaItem.resource_type || "image",
                  url: mediaItem.url || mediaItem.secure_url,
                  createdAt: memory.date || memory.created_at || null,
                }));
              }

              // Fallback for direct media fields
              if (memory.media_url) {
                return [
                  {
                    id: memory._id || memory.id,
                    title: memory.title || "Untitled",
                    type: memory.media_type || "image",
                    url: memory.media_url,
                    createdAt: memory.date || memory.created_at || null,
                  },
                ];
              }

              return [];
            })
            .filter((item) => item.url);

          // FALLBACK ERROR CORRECTION: If albumMedia is empty but we suspect there are records,
          // try to search for memories that have this album id in their metadata/junction.
          if (fetchedMedia.length === 0) {
            console.log(
              "[ALBUM-DETAIL] No media found in payload, trying fallback search...",
            );
            try {
              // Search for all memories for this user
              const allMemoriesResp = await memoriesAPI.getAll();
              if (allMemoriesResp.data?.success) {
                const allMemories = Array.isArray(allMemoriesResp.data.data)
                  ? allMemoriesResp.data.data
                  : allMemoriesResp.data.data?.memories || [];

                // Filter memories that belong to this album
                const albumSpecificMemories = allMemories.filter((m) => {
                  const mId =
                    m.album_id || m.albumId || m.album_memories?.[0]?.album_id;
                  return mId === id;
                });

                if (albumSpecificMemories.length > 0) {
                  const fallbackMedia = albumSpecificMemories.flatMap((m) => {
                    // Try to get media URL
                    const mUrl = m.media_url || m.media?.[0]?.url;
                    if (!mUrl) return [];
                    return [
                      {
                        id: m._id || m.id,
                        title: m.title || "Untitled",
                        type: m.media_type || m.media?.[0]?.type || "image",
                        url: mUrl,
                        createdAt: m.date || m.created_at || null,
                      },
                    ];
                  });
                  fetchedMedia = fallbackMedia;
                }
              }
            } catch (fallbackError) {
              console.error(
                "[ALBUM-DETAIL] Fallback search failed:",
                fallbackError,
              );
            }
          }

          setAlbumMedia(fetchedMedia);
        }
      } catch (err) {
        console.error("[ALBUM-DETAIL] Fetch failed:", err);
        setAlbum(null);
        setAlbumMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading album..." />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-stone-900 mb-2">
          Album not found
        </h2>
        <button
          onClick={() => navigate("/albums")}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-600"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Albums
        </button>
      </div>
    );
  }

  const coverImage = resolveCoverImage(album);
  const isPrivate =
    album?.isPrivate ??
    (album?.is_public !== undefined ? !album.is_public : true);

  const createUploadHandler = (type) => async (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file) {
      return;
    }

    if (type === "photo" && !file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }

    if (type === "voice" && !file.type.startsWith("audio/")) {
      toast.error("Please select an audio file.");
      return;
    }

    try {
      setUploadingType(type);
      const formData = new FormData();
      formData.append("title", `${album.name || "Album"} ${type}`);
      formData.append("description", `Uploaded from album ${album.name || ""}`);
      formData.append("is_public", isPrivate ? "false" : "true");
      formData.append("album_id", id);
      formData.append("file", file);

      const response = await memoriesAPI.createWithFile(formData);
      if (response.data?.success) {
        const createdMemory =
          response.data?.data?.memory || response.data?.data;

        // Get media URL and type from response
        let mediaUrl = createdMemory?.media_url;
        let mediaType = createdMemory?.media_type;

        // If media URL not directly available, try to get from media array
        if (
          !mediaUrl &&
          Array.isArray(createdMemory?.media) &&
          createdMemory.media.length > 0
        ) {
          mediaUrl = createdMemory.media[0]?.url;
          mediaType = createdMemory.media[0]?.type;
        }

        console.log("[ALBUM-UPLOAD] Memory created:", {
          id: createdMemory?.id,
          mediaUrl,
          mediaType,
        });

        const createdItem = {
          id: createdMemory?.id || `${Date.now()}`,
          title: createdMemory?.title || `${album.name || "Album"} ${type}`,
          type: mediaType || (type === "voice" ? "audio" : type),
          url: mediaUrl,
          createdAt: createdMemory?.created_at || new Date().toISOString(),
        };

        // Add to state immediately if we have URL
        if (createdItem.url) {
          console.log("[ALBUM-UPLOAD] Adding to album media:", createdItem);
          setAlbumMedia((prev) => [createdItem, ...prev]);
          toast.success(`${type} uploaded successfully!`);
        } else {
          // If no URL, refresh album to get updated media list
          console.log("[ALBUM-UPLOAD] No immediate URL, refetching album...");
          const refreshResponse = await albumsAPI.getById(id);
          if (refreshResponse.data?.success) {
            const refreshedAlbum =
              refreshResponse.data?.data?.album || refreshResponse.data?.data;
            if (refreshedAlbum?.memories) {
              // Rebuild media list from refreshed album
              const updatedMedia = (refreshedAlbum.memories || [])
                .flatMap((item) => {
                  const memory = item.memory || item;
                  if (!memory || typeof memory !== "object") return [];

                  if (Array.isArray(memory.media) && memory.media.length > 0) {
                    return memory.media.map((mediaItem, index) => ({
                      id: `${memory._id || memory.id}-${index}`,
                      title: memory.title || "Untitled",
                      type:
                        mediaItem.type || mediaItem.resource_type || "image",
                      url: mediaItem.url || mediaItem.secure_url,
                      createdAt: memory.date || memory.created_at || null,
                    }));
                  }

                  if (memory.media_url) {
                    return [
                      {
                        id: memory._id || memory.id,
                        title: memory.title || "Untitled",
                        type: memory.media_type || "image",
                        url: memory.media_url,
                        createdAt: memory.date || memory.created_at || null,
                      },
                    ];
                  }
                  return [];
                })
                .filter((item) => item.url);

              setAlbumMedia(updatedMedia);
              toast.success(`${type} uploaded successfully!`);
            }
          }
        }

        if (type === "photo" && !resolveCoverImage(album)) {
          const coverFormData = new FormData();
          coverFormData.append("title", album.name || album.title || "Album");
          coverFormData.append("description", album.description || "");
          coverFormData.append("is_public", isPrivate ? "false" : "true");
          coverFormData.append("file", file);

          try {
            const coverResponse = await albumsAPI.updateWithFile(
              id,
              coverFormData,
            );
            if (coverResponse.data?.success) {
              const updatedAlbum =
                coverResponse.data?.data?.album || coverResponse.data?.data;
              setAlbum(updatedAlbum || album);
            }
          } catch {
            // Keep upload successful even if cover update fails.
          }
        }
      } else {
        toast.error(`Failed to upload ${type}.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to upload ${type}.`);
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/albums")}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Albums
      </button>

      <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white">
        {coverImage ? (
          <img
            src={coverImage}
            alt={album.name || album.title || "Album cover"}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-stone-100">
            <FiImage className="w-14 h-14 text-stone-400" />
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900">
              {album.name || album.title || "Untitled Album"}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
              {isPrivate ? (
                <>
                  <FiLock className="h-3.5 w-3.5" />
                  Private
                </>
              ) : (
                <>
                  <FiGlobe className="h-3.5 w-3.5" />
                  Public
                </>
              )}
            </span>
          </div>
          {album.description ? (
            <p className="mt-2 text-stone-600">{album.description}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">
          Upload to this album
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Choose one option to upload a single file.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-amber-300 hover:bg-amber-50">
            <FiUpload className="h-4 w-4" />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={createUploadHandler("photo")}
              disabled={Boolean(uploadingType)}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-amber-300 hover:bg-amber-50">
            <FiVideo className="h-4 w-4" />
            Upload Video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={createUploadHandler("video")}
              disabled={Boolean(uploadingType)}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-amber-300 hover:bg-amber-50">
            <FiMic className="h-4 w-4" />
            Upload Voice
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={createUploadHandler("voice")}
              disabled={Boolean(uploadingType)}
            />
          </label>
        </div>

        {uploadingType ? (
          <p className="mt-3 text-sm text-amber-700">
            Uploading {uploadingType}...
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Album Media</h2>
        <p className="mt-1 text-sm text-stone-500">
          {albumMedia.length} {albumMedia.length === 1 ? "file" : "files"} in
          this album
        </p>

        {albumMedia.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-sm text-stone-500">
            No media uploaded yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {albumMedia.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white"
              >
                {item.type === "video" ? (
                  <div
                    onClick={() => {
                      setSelectedMedia(item);
                      setShowPreview(true);
                    }}
                    className="cursor-pointer"
                  >
                    <video
                      src={item.url}
                      className="h-44 w-full bg-black object-cover"
                    />
                  </div>
                ) : item.type === "audio" ? (
                  <div className="flex h-44 w-full items-center justify-center bg-stone-100 p-4">
                    <audio src={item.url} controls className="w-full" />
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setSelectedMedia(item);
                      setShowPreview(true);
                    }}
                    className="cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.title || "Album media"}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {item.title || "Untitled"}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {clockTick >= 0 && item.createdAt
                      ? formatDate(item.createdAt, "relative")
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPreview && selectedMedia?.url ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 md:p-6 backdrop-blur-md"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="max-h-full max-w-5xl w-full flex flex-col items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="fixed top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md z-[10000]"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {selectedMedia.type === "image" ||
            selectedMedia.type === "photo" ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            ) : selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                className="w-full max-h-[90vh] rounded-lg shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <div className="bg-stone-900 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <audio src={selectedMedia.url} className="w-full" controls />
              </div>
            )}

            {selectedMedia.title && (
              <div className="mt-4 text-center">
                <h3 className="text-white text-xl font-medium">
                  {selectedMedia.title}
                </h3>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AlbumDetail;
