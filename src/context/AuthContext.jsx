import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);

const normalizeRole = (role) => (role || "").toLowerCase();

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

const normalizeUser = (user) => {
  if (!user) return null;
  const role = normalizeRole(user.role) === "admin" ? "admin" : "user";
  const displayName =
    user.full_name || user.name || user.username || user.email;

  return {
    id: user.id,
    email: user.email,
    name: displayName,
    username: displayName,
    full_name: displayName,
    bio: user.bio || "",
    avatar_url: user.avatar_url || "",
    role,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        const userFromApi = normalizeUser(response?.data?.data?.user);

        if (!userFromApi) {
          clearAuthStorage();
          setUser(null);
          setLoading(false);
          return;
        }

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userFromApi));
        setUser(userFromApi);
      } catch {
        clearAuthStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const register = async (name, email, password, role, adminSignupKey = "") => {
    setError("");
    setAuthActionLoading(true);
    const normalizedRole = normalizeRole(role);

    const allowedRoles = ["admin", "user"];
    if (!allowedRoles.includes(normalizedRole)) {
      setAuthActionLoading(false);
      setError("Please choose a valid role.");
      return { success: false, error: "Please choose a valid role." };
    }

    try {
      const response = await authAPI.register({
        full_name: name,
        email,
        password,
        role: normalizedRole,
        admin_signup_key: adminSignupKey,
      });

      const data = response?.data?.data || {};
      const userFromApi = normalizeUser(data.user);

      if (!data.access_token || !userFromApi) {
        throw new Error("Invalid register response");
      }

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userFromApi));
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      setUser(userFromApi);
      return { success: true, user: userFromApi };
    } catch (err) {
      clearAuthStorage();
      setUser(null);
      const message =
        err?.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setAuthActionLoading(false);
    }
  };

  const login = async (email, password) => {
    setError("");
    setAuthActionLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const data = response?.data?.data || {};
      const userFromApi = normalizeUser(data.user);

      if (!data.access_token || !userFromApi) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userFromApi));
      setUser(userFromApi);
      return { success: true, user: userFromApi };
    } catch (err) {
      clearAuthStorage();
      setUser(null);
      const message =
        err?.response?.data?.message || "Invalid email or password.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setAuthActionLoading(false);
    }
  };

  const logout = async () => {
    clearAuthStorage();
    setUser(null);
  };

  const updateProfile = async (payload) => {
    setError("");

    try {
      const response = await authAPI.updateProfile(payload);
      const userFromApi = normalizeUser(response?.data?.data?.user);

      if (!userFromApi) {
        throw new Error("Invalid profile response");
      }

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userFromApi));
      setUser(userFromApi);
      return { success: true, user: userFromApi };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to update profile right now. Please try again.";
      setError(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (payload) => {
    setError("");

    try {
      await authAPI.changePassword(payload);
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to update password right now. Please try again.";
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isLoading: authActionLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
