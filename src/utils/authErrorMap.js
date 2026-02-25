const AUTH_ERROR_MAP = {
  // Email format errors - toast.error
  "Invalid email format": {
    userMessage: "Invalid email format. Please enter a valid email address.",
    display: "toast",
    toastType: "error",
    field: "email",
  },
  // Password too short - toast.error
  "Password must be at least 6 characters": {
    userMessage: "Password must be at least 6 characters long.",
    display: "toast",
    toastType: "error",
    field: "password",
  },
  // No account found - toast.error
  "No account found with this email": {
    userMessage:
      "We couldn't find an account with that email. Is it spelled correctly?",
    display: "toast",
    toastType: "error",
    field: "email",
  },
  // Wrong password - toast.error
  "Wrong password": {
    userMessage: "That password isn't correct. Please try again.",
    display: "toast",
    toastType: "error",
    field: "password",
  },
  // Email not verified - toast.warning
  "Please verify your email first": {
    userMessage:
      "Please check your email and verify your account before logging in.",
    display: "toast",
    toastType: "warning",
    field: "general",
  },
  // Admin key errors - toast.error
  "Invalid admin key": {
    userMessage: "Invalid admin key. Please enter a valid authorization key.",
    display: "toast",
    toastType: "error",
    field: "admin_signup_key",
  },
  // Admin signup not allowed - toast.error
  "Admin signup is not allowed": {
    userMessage: "Admin registration requires a valid signup key.",
    display: "toast",
    toastType: "error",
    field: "admin_signup_key",
  },
  // Invalid credentials - toast.error
  "Invalid credentials": {
    userMessage:
      "Invalid credentials. Please check your details and try again.",
    display: "toast",
    toastType: "error",
    field: "general",
  },
  // Auth service/network errors - toast.error
  "Authentication service is unreachable. Please check your internet or VPN and try again.":
    {
      userMessage:
        "Unable to connect right now. Please check your internet/VPN and try again.",
      display: "toast",
      toastType: "error",
      field: "general",
    },
  "fetch failed": {
    userMessage:
      "Unable to connect right now. Please check your internet and try again.",
    display: "toast",
    toastType: "error",
    field: "general",
  },
  // Email already exists - toast.warning
  "An account with this email already exists": {
    userMessage:
      "An account with this email already exists. Please login instead.",
    display: "toast",
    toastType: "warning",
    field: "email",
  },
};

export const mapAuthError = (backendMessage) => {
  const message = String(backendMessage || "").trim();
  if (AUTH_ERROR_MAP[message]) {
    return AUTH_ERROR_MAP[message];
  }

  if (
    message.toLowerCase().includes("authentication service is unreachable") ||
    message.toLowerCase().includes("fetch failed") ||
    message.toLowerCase().includes("connect timeout") ||
    message.toLowerCase().includes("certificate") ||
    message.toLowerCase().includes("tls")
  ) {
    return {
      userMessage:
        "Unable to connect right now. Please check your internet/VPN and try again.",
      display: "toast",
      toastType: "error",
      field: "general",
    };
  }

  return {
    userMessage: "Something went wrong. Please try again.",
    display: "toast",
    toastType: "error",
    field: "general",
  };
};
