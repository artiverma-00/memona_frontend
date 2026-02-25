import axios from "axios";
import { API_URL, STORAGE_KEYS } from "../utils/constants";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes default timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const requestUrl = String(error.config?.url || "");
      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/me");

      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Let auth form requests handle and display their own errors.
          if (isAuthRequest) {
            break;
          }

          // Unauthorized on protected APIs: clear token and redirect to login.
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = "/login";
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/password", data),
  logout: () => api.post("/auth/logout"),
};

// Memories API
export const memoriesAPI = {
  getAll: (params) => api.get("/memories", { params }),
  getById: (id) => api.get(`/memories/${id}`),
  create: (data) => api.post("/memories", data),
  createWithFile: (formData) =>
    api.post("/memories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000, // 10 minutes for large video uploads
    }),
  update: (id, data) => api.put(`/memories/${id}`, data),
  delete: (id) => api.delete(`/memories/${id}`),
  like: (id) => api.post(`/interactions/memories/${id}/likes`),
  unlike: (id) => api.delete(`/interactions/memories/${id}/likes`),
  getLikeSummary: (id) => api.get(`/interactions/memories/${id}/likes`),
  share: (id, data) => api.post(`/memories/${id}/share`, data),
  getMapLocations: () => api.get("/memories/map"),
  getTimeline: (year) => api.get(`/memories/timeline/${year}`),
};

// Albums API
export const albumsAPI = {
  getAll: (params) => api.get("/albums", { params }),
  getById: (id) => api.get(`/albums/${id}`),
  create: (data) => api.post("/albums", data),
  createWithFile: (formData) =>
    api.post("/albums", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000, // 10 minutes for large video uploads
    }),
  update: (id, data) => api.put(`/albums/${id}`, data),
  updateWithFile: (id, formData) =>
    api.put(`/albums/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000, // 10 minutes for large video uploads
    }),
  delete: (id) => api.delete(`/albums/${id}`),
  addMemory: (id, memoryId) => api.post(`/albums/${id}/memories`, { memoryId }),
  removeMemory: (id, memoryId) =>
    api.delete(`/albums/${id}/memories/${memoryId}`),
  share: (id, data) => api.post(`/albums/${id}/share`, data),
};

// Milestones API
export const milestonesAPI = {
  getAll: (params) => api.get("/milestones", { params }),
  getById: (id) => api.get(`/milestones/${id}`),
  create: (data) => api.post("/milestones", data),
  update: (id, data) => api.put(`/milestones/${id}`, data),
  delete: (id) => api.delete(`/milestones/${id}`),
  getTodayReminders: () => api.get("/milestones/today"),
};

export default api;
