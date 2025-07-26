import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";

export default function SignIn() {
  const [role, setRole] = useState<UserRole>("doctor");
  const [location, setLocation] = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  // Handle redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated && user && location === "/signin") {
      if (user.role === 'admin') {
        setLocation("/admin/dashboard");
      } else if (user.role === 'doctor') {
        setLocation("/doctor/dashboard");
      } else if (user.role === 'patient') {
        setLocation("/patient/dashboard");
      }
    }
  }, [isAuthenticated, user, location, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let user;
    if (role === "doctor") {
      user = { name: "Dr. Monjed", role: "doctor" as UserRole };
      login(user);
      // Remove immediate setLocation - let useEffect handle the redirect
    } else if (role === "patient") {
      user = { name: "Mock Patient", role: "patient" as UserRole };
      login(user);
      // Remove immediate setLocation - let useEffect handle the redirect
    } else if (role === "admin") {
      user = { name: "Admin User", role: "admin" as UserRole };
      login(user);
      // Remove immediate setLocation - let useEffect handle the redirect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to your account to continue
          </p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Select your role to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full border rounded px-3 py-2 text-slate-700"
                >
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
