import { useEffect, useState } from "react";
import { FiLogIn, FiMail, FiLock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { mapAuthError } from "../../utils/authErrorMap";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user?.role) {
      return;
    }
    navigate(user.role === "admin" ? "/admin" : "/dashboard", {
      replace: true,
    });
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors({ email: "", password: "" });
    const result = await login(email, password);
    if (!result.success) {
      const config = mapAuthError(result.error);
      if (config.display === "toast") {
        // Use the appropriate toast type based on the error
        if (config.toastType === "warning") {
          toast.warning(config.userMessage);
        } else {
          toast.error(config.userMessage);
        }
        return;
      }

      if (config.field === "general") {
        setFormError(config.userMessage);
        return;
      }

      if (config.field === "email" || config.field === "password") {
        setFieldErrors((prev) => ({
          ...prev,
          [config.field]: config.userMessage,
        }));
        return;
      }

      setFormError(config.userMessage);
      return;
    }

    // Show role-specific success toast and redirect
    if (result.user.role === "admin") {
      toast.success("Admin login successful. Welcome back!");
    } else {
      toast.success("Successfully logged in!");
    }
    navigate(result.user.role === "admin" ? "/admin" : "/dashboard", {
      replace: true,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 via-white to-amber-50/30 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Back Button */}

        <div className="rounded-3xl border border-stone-200/60 bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-semibold text-stone-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Sign in to continue to your MemoryLane account.
          </p>

          {formError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">
                Email Address
              </span>
              <div className="flex items-center gap-3 rounded-lg border border-stone-300 bg-white px-4 transition focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-200">
                <FiMail className="text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                    setFormError("");
                  }}
                  placeholder="you@example.com"
                  className="w-full bg-transparent py-3 text-sm text-stone-900 placeholder-stone-400 outline-none"
                  required
                />
              </div>
              {fieldErrors.email ? (
                <p className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">
                Password
              </span>
              <div className="flex items-center gap-3 rounded-lg border border-stone-300 bg-white px-4 transition focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-200">
                <FiLock className="text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                    setFormError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-transparent py-3 text-sm text-stone-900 placeholder-stone-400 outline-none"
                  required
                />
              </div>
              {fieldErrors.password ? (
                <p className="mt-2 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-semibold text-stone-900 transition hover:from-amber-500 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiLogIn />
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-amber-600 transition hover:text-amber-700"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
