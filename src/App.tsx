import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Landing from "@/pages/Shared/Landing";
import Register from "./pages/Auth/Register";
import SignIn from "@/pages/Auth/SignIn";
import AdminDashboard from "@/pages/Admin/Dashboard";
import DoctorDashboard from "@/pages/Doctor/Dashboard";
import PatientDashboard from "@/pages/Patient/Dashboard";
import AdminPanel from "@/pages/Admin/AdminPanel";
import Profile from "@/pages/Shared/Profile";
import Onboarding from "@/pages/Auth/Onboarding";
import PatientMedications from "@/pages/Patient/Medications";
import PatientHealthMetrics from "@/pages/Patient/HealthMetrics";
import PatientCarePlans from "@/pages/Patient/CarePlans";
import PatientAppointments from "@/pages/Patient/Appointments";
import PatientAlerts from "@/pages/Patient/Alerts";
import Reports from "@/pages/Admin/Reports";
import ManageUsers from "@/pages/Admin/ManageUsers";
import DoctorPatients from "@/pages/Doctor/Patients";
import DoctorCarePlans from "@/pages/Doctor/CarePlans";
import NotFound from "./pages/Shared/not-found";
import DoctorAlerts from "@/pages/Doctor/Alerts";
import React from "react";
import { UserRole } from "@/types";
import DoctorAppointments from "@/pages/Doctor/Appointments";
import DoctorMedications from "@/pages/Doctor/Medications";
import { useToast } from "@/hooks/use-toast";
import DoctorPatientDetails from "@/pages/Doctor/PatientDetails";
import RequireAuth from "@/components/RequireAuth";

type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  createdAt?: string;
  role?: UserRole;
};

function Router() {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const hasRedirected = React.useRef(false);

  // Redirect authenticated users to their appropriate dashboard only if they're on the root path or landing
  React.useEffect(() => {
    if (isAuthenticated && user && (location === "/" || location === "/landing")) {
      if (user.role === 'admin') {
        setLocation("/admin/dashboard");
      } else if (user.role === 'doctor') {
        setLocation("/doctor/dashboard");
      } else if (user.role === 'patient') {
        setLocation("/patient/dashboard");
      }
    }
  }, [isAuthenticated, user, location, setLocation]);

  // Redirect unauthenticated users away from protected routes
  React.useEffect(() => {
    // Reset redirect flag when authentication state changes
    if (isAuthenticated) {
      hasRedirected.current = false;
      return;
    }

    // Only redirect if we haven't already redirected and user is not authenticated
    if (!isAuthenticated && !hasRedirected.current) {
      const protectedRoutes = [
        '/admin', '/doctor', '/patient', '/profile', '/onboarding', 
        '/reports', '/medications', '/health', '/care-plans', '/appointments', '/alerts'
      ];
      
      const publicRoutes = ['/signin', '/register', '/landing', '/'];
      
      const isOnProtectedRoute = protectedRoutes.some(route => 
        location.startsWith(route)
      );
      
      const isOnPublicRoute = publicRoutes.some(route => 
        location === route || location.startsWith(route)
      );
      
      // Only redirect if on protected route and not on public route
      if (isOnProtectedRoute && !isOnPublicRoute) {
        hasRedirected.current = true;
        setLocation("/signin");
      }
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Show Navigation only for authenticated users */}
      {isAuthenticated && <Navigation />}
      
      <Switch>
        {/* Public routes - accessible to all users */}
        <Route path="/" component={Landing} />
        <Route path="/signin" component={SignIn} />
        <Route path="/register" component={Register} />
        <Route path="/landing" component={Landing} />
        
        {/* Protected routes - only for authenticated users */}
        {isAuthenticated && (
          <>
            {/* Role-based dashboard routes with RequireAuth */}
            <Route path="/doctor/dashboard">
              <RequireAuth role="doctor">
                <DoctorDashboard />
              </RequireAuth>
            </Route>
            <Route path="/patient/dashboard">
              <RequireAuth role="patient">
                <PatientDashboard />
              </RequireAuth>
            </Route>
            
            {/* Shared routes */}
            <Route path="/profile" component={Profile} />
            <Route path="/onboarding" component={Onboarding} />
            
            {/* Patient routes */}
            <Route path="/patient/medications">
              <RequireAuth role="patient">
                <PatientMedications />
              </RequireAuth>
            </Route>
            <Route path="/patient/health-metrics">
              <RequireAuth role="patient">
                <PatientHealthMetrics />
              </RequireAuth>
            </Route>
            <Route path="/patient/care-plans">
              <RequireAuth role="patient">
                <PatientCarePlans />
              </RequireAuth>
            </Route>
            <Route path="/patient/appointments">
              <RequireAuth role="patient">
                <PatientAppointments />
              </RequireAuth>
            </Route>
            <Route path="/patient/alerts">
              <RequireAuth role="patient">
                <PatientAlerts />
              </RequireAuth>
            </Route>
            
            {/* Doctor routes */}
            <Route path="/doctor/patients">
              <RequireAuth role="doctor">
                <DoctorPatients />
              </RequireAuth>
            </Route>
            <Route path="/doctor/patients/:id">
              <RequireAuth role="doctor">
                <DoctorPatientDetails />
              </RequireAuth>
            </Route>
            <Route path="/doctor/appointments">
              <RequireAuth role="doctor">
                <DoctorAppointments />
              </RequireAuth>
            </Route>
            <Route path="/doctor/medications">
              <RequireAuth role="doctor">
                <DoctorMedications />
              </RequireAuth>
            </Route>
            <Route path="/doctor/care-plans">
              <RequireAuth role="doctor">
                <DoctorCarePlans />
              </RequireAuth>
            </Route>
            <Route path="/doctor/alerts">
              <RequireAuth role="doctor">
                <DoctorAlerts />
              </RequireAuth>
            </Route>
            
            {/* Admin routes */}
            <Route path="/reports">
              <RequireAuth role="admin">
                <Reports />
              </RequireAuth>
            </Route>
            <Route path="/admin/users">
              <RequireAuth role="admin">
                <ManageUsers />
              </RequireAuth>
            </Route>
            <Route path="/admin">
              <RequireAuth role="admin">
                <AdminPanel />
              </RequireAuth>
            </Route>
          </>
        )}
        
        {/* 404 route for any unmatched paths */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
