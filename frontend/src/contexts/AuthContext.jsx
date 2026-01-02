import React, { createContext, useContext, useState, useEffect } from "react";

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
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({ ...parsed, role: normalizeRole(parsed.role) });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("workdesks_user", JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const register = async (email, password, name) => {
    const exists = MOCK_USERS.find((u) => u.email === email);
    if (exists) {
      return { success: false, error: "Email already registered" };
    }
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      email,
      name,
      role: "customer",
      avatar: null,
    };
    setUser(newUser);
    localStorage.setItem("workdesks_user", JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("workdesks_user");
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
