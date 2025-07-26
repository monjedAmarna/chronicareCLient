import React from "react";
import { UserRole } from "@/types";

type User = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  dateOfBirth?: string;
  [key: string]: any; // Allow additional properties
};

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Sync with localStorage on mount and when user changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    }
  }, [user]);

  // Login: store user in localStorage and update state
  const login = (mockUser: User) => {
    setUser(mockUser);
  };

  // Logout: remove user from localStorage and reset state
  const logout = () => {
    setUser(null);
  };

  // Logout and immediately redirect to signin (for Switch Role functionality)
  const logoutAndRedirect = () => {
    // Clear localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    // Reset state
    setUser(null);
    // Hard redirect to signin using replace() to prevent UI artifacts
    window.location.replace("/signin");
  };

  return {
    user,
    login,
    logout,
    logoutAndRedirect,
    isAuthenticated: !!user,
    isLoading: false, // Always false since we're using localStorage (synchronous)
  };
}
