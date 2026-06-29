import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if we have one) to every outgoing request.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("wellspring_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so every page can read `error.message` safely,
// and bounce back to login if the session has expired.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    if (status === 401 && !error.config?.url?.includes("/auth/login")) {
      const hadToken = !!localStorage.getItem("wellspring_token");
      localStorage.removeItem("wellspring_token");
      localStorage.removeItem("wellspring_user");
      if (hadToken && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ ...error, message, fieldErrors: error.response?.data?.fieldErrors });
  }
);

export default axiosClient;
