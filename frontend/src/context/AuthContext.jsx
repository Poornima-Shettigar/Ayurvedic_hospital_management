import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = localStorage.getItem("wellspring_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("wellspring_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getCurrentUser()
      .then((data) => {
        const refreshed = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          approved: data.approved,
        };
        setUser(refreshed);
        localStorage.setItem("wellspring_user", JSON.stringify(refreshed));
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("wellspring_token");
        localStorage.removeItem("wellspring_user");
      })
      .finally(() => setLoading(false));
    // Only run once on initial mount to validate the persisted session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = useCallback((data) => {
    const sessionUser = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      approved: data.approved,
    };
    localStorage.setItem("wellspring_token", data.token);
    localStorage.setItem("wellspring_user", JSON.stringify(sessionUser));
    setToken(data.token);
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const login = useCallback(
    async (email, password) => persistSession(await authApi.loginUser({ email, password })),
    [persistSession]
  );

  const registerPatient = useCallback(
    async (payload) => persistSession(await authApi.registerPatient(payload)),
    [persistSession]
  );

  const registerDoctor = useCallback(
    async (payload) => persistSession(await authApi.registerDoctor(payload)),
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("wellspring_token");
    localStorage.removeItem("wellspring_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, loading, login, registerPatient, registerDoctor, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
