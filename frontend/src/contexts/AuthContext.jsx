import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

// Mock users for demo - Roles: superadmin, company_manager, agent
const MOCK_USERS = [
  { id: "1", email: "superadmin@workdesks.com", password: "super123", name: "Super Admin", role: "superadmin", avatar: null },
  { id: "2", email: "manager@workdesks.com", password: "manager123", name: "Company Manager", role: "company_manager", avatar: null },
  { id: "3", email: "agent@workdesks.com", password: "agent123", name: "Support Agent", role: "agent", avatar: null },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeRole = (role) => {
    if (!role) return role;
    if (role === "manager") return "company_manager";
    if (role === "admin") return "superadmin";
    return role;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("workdesks_user");
    const token = localStorage.getItem("workdesks_token");

    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({ ...parsed, role: normalizeRole(parsed.role) });
      } catch (e) {
        console.error("Failed to parse user", e);
        localStorage.removeItem("workdesks_user");
        localStorage.removeItem("workdesks_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      // data.data.user, data.data.token
      const { user: userData, token } = data.data;

      const normalizedUser = { ...userData, role: normalizeRole(userData.role) };

      setUser(normalizedUser);
      localStorage.setItem("workdesks_user", JSON.stringify(normalizedUser));
      localStorage.setItem("workdesks_token", token);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const register = async (email, password, name) => {
    try {
      const data = await api.register(name, email, password);
      const { user: userData, token } = data.data;

      const normalizedUser = { ...userData, role: normalizeRole(userData.role) };

      setUser(normalizedUser);
      localStorage.setItem("workdesks_user", JSON.stringify(normalizedUser));
      localStorage.setItem("workdesks_token", token);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("workdesks_user");
    localStorage.removeItem("workdesks_token");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isSuperAdmin: user?.role === "superadmin",
    isManager: user?.role === "company_manager" || user?.role === "superadmin",
    isAgent: user?.role === "agent" || user?.role === "company_manager" || user?.role === "superadmin",
    isCustomer: user?.role === "customer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
