/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/authApi";

const storageKey = "montrix-auth";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey));
      const token = parsed?.token;
      const user = parsed?.user;

      if (!token || typeof token !== "string" || !user) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem("montrixToken");
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem(storageKey);
      localStorage.removeItem("montrixToken");
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(storageKey, JSON.stringify(auth));
      localStorage.setItem("montrixToken", auth.token);
    } else {
      localStorage.removeItem(storageKey);
      localStorage.removeItem("montrixToken");
    }
  }, [auth]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const data = response.data?.data || response.data;
    const token = data.token || data.accessToken || data.jwt;
    const user =
      data.user ||
      (data.role
        ? {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          }
        : data);

    if (!token) {
      throw new Error("Login response missing auth token");
    }

    setAuth({ token, refreshToken: data.refreshToken || null, user });
    return response;
  };

  const register = async (details) => {
    const response = await registerUser(details);
    return response;
  };

  const logout = () => {
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
