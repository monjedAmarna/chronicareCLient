import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface RequireAuthProps {
  role: "doctor" | "patient" | "admin";
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ role, children }) => {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated || !user || user.role !== role) {
      setLocation("/signin");
    }
  }, [user, isAuthenticated, role, setLocation]);

  if (!isAuthenticated || !user || user.role !== role) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth; 