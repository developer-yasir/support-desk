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
  const [needsSetup, setNeedsSetup] = useState(false);

  const normalizeRole = (role) => {
    if (!role) return role;
    if (role === "manager") return "company_manager";
    if (role === "admin" || role === "super_admin") return "superadmin";
    return role;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("workdesks_user");
    const token = localStorage.getItem("workdesks_token");
    const savedNeedsSetup = localStorage.getItem("workdesks_needs_setup");

    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({ ...parsed, role: normalizeRole(parsed.role) });
        setNeedsSetup(savedNeedsSetup === "true");
      } catch (e) {
        console.error("Failed to parse user", e);
        localStorage.removeItem("workdesks_user");
        localStorage.removeItem("workdesks_token");
        localStorage.removeItem("workdesks_needs_setup");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      // data.data.user, data.data.token, data.data.needsSetup
      const { user: userData, token, needsSetup: setupRequired } = data.data;

      const normalizedUser = { ...userData, role: normalizeRole(userData.role) };

      setUser(normalizedUser);
      setNeedsSetup(setupRequired || false);
      localStorage.setItem("workdesks_user", JSON.stringify(normalizedUser));
      localStorage.setItem("workdesks_token", token);
      localStorage.setItem("workdesks_needs_setup", String(setupRequired || false));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.register(data);
      const { user: userData, token, needsSetup: setupRequired } = res.data;

      const normalizedUser = { ...userData, role: normalizeRole(userData.role) };

      setUser(normalizedUser);
      setNeedsSetup(setupRequired || false);
      localStorage.setItem("workdesks_user", JSON.stringify(normalizedUser));
      localStorage.setItem("workdesks_token", token);
      localStorage.setItem("workdesks_needs_setup", String(setupRequired || false));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setNeedsSetup(false);
    localStorage.removeItem("workdesks_user");
    localStorage.removeItem("workdesks_token");
    localStorage.removeItem("workdesks_needs_setup");
  };

  const completeSetup = () => {
    setNeedsSetup(false);
    localStorage.setItem("workdesks_needs_setup", "false");
  };

  const updateUserCompany = (updatedCompany) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      company: updatedCompany
    };

    setUser(updatedUser);
    localStorage.setItem("workdesks_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    completeSetup,
    updateUserCompany,
    needsSetup,
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
