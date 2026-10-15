import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const readAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("montrix-auth"));
  } catch {
    return null;
  }
};

const clearAuth = () => {
  localStorage.removeItem("montrixToken");
  localStorage.removeItem("montrix-auth");
};

api.interceptors.request.use((config) => {
  const token = (localStorage.getItem("montrixToken") || "").trim();
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// One refresh at a time; concurrent 401s wait for the same promise.
let refreshPromise = null;

const refreshAccessToken = () => {
  const stored = readAuth();
  const refreshToken = stored?.refreshToken;

  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token"));
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/api/auth/refresh`, null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((res) => {
        const data = res.data?.data || res.data;
        const newToken = data?.token;
        if (!newToken) {
          throw new Error("Refresh response missing token");
        }
        localStorage.setItem("montrixToken", newToken);
        localStorage.setItem("montrix-auth", JSON.stringify({ ...stored, token: newToken }));
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;
    const url = original?.url || "";
    const isAuthCall = url.startsWith("/api/auth/login") || url.startsWith("/api/auth/register") || url.startsWith("/api/auth/refresh");

    if (import.meta.env.DEV) {
      console.error("API request failed", {
        status,
        method: original?.method,
        url,
        message: error?.response?.data?.message || error.message,
      });
    }

    // Expired access token: try once to refresh, then replay the request.
    if (status === 401 && original && !original._retried && !isAuthCall && readAuth()?.refreshToken) {
      original._retried = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        clearAuth();
        return Promise.reject(error);
      }
    }

    const isProtectedEndpoint =
      url.startsWith("/api/cart") ||
      url.startsWith("/api/admin") ||
      url.startsWith("/api/user") ||
      url.startsWith("/api/orders") ||
      url.startsWith("/api/payments") ||
      url.startsWith("/api/auth/profile");

    if ((status === 401 && !isAuthCall) || (status === 403 && isProtectedEndpoint)) {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

export default api;
