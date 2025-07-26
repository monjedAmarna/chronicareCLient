import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getUsers, User } from "@/api/users.api";
import { UserRole } from "@/types";
import { getPatients, Patient } from "@/api/patients.api";
import { getAppointments } from "@/api/appointments.api";
import { getAlerts, Alert } from "@/api/alerts.api";
import { getReportStats, ReportStats } from "@/api/reports.api";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  UserCheck, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
  Shield,
  Clock,
  Heart,
  Droplet,
  HeartPulse,
  RefreshCw
} from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [location] = useLocation();
  const { user, logoutAndRedirect } = useAuth();

  // Handle role switching for demo mode
  const handleSwitchRole = () => {
    logoutAndRedirect();
  };

  // Fetch various data
  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["users", "admin", location],
    queryFn: () => getUsers(),
  });

  const { data: patients, isLoading: patientsLoading, isError: patientsError } = useQuery({
    queryKey: ["patients", "admin", location],
    queryFn: getPatients,
  });

  const { data: appointments, isLoading: appointmentsLoading, isError: appointmentsError } = useQuery({
    queryKey: ["appointments", "admin", location],
    queryFn: getAppointments,
  });

  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useQuery({
    queryKey: ["alerts", "admin", location],
    queryFn: getAlerts,
  });

  const { data: reportStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["reportStats", "admin", location],
    queryFn: getReportStats,
  });

  // System Health Overview - fetch from /api/system/health
  const { data: systemHealth, isLoading: healthLoading, isError: healthError } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const res = await axios.get("/api/system/health");
      return res.data;
    },
  });

  // Recent Activity - fetch from /api/activities
  const { data: activitiesData, isLoading: activitiesLoading, isError: activitiesError } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const res = await axios.get("/api/activities");
      return res.data;
    },
  });

  // Average Glucose - fetch from /api/health-metrics/average-glucose
  const { data: avgGlucoseData, isLoading: avgGlucoseLoading, isError: avgGlucoseError } = useQuery({
    queryKey: ["average-glucose"],
    queryFn: async () => {
      const res = await axios.get("/api/health-metrics/average-glucose");
      return res.data;
    },
  });

  // Health Metrics Summary - fetch from /api/health-metrics/summary
  const { data: metricsSummary, isLoading: metricsSummaryLoading, isError: metricsSummaryError } = useQuery({
    queryKey: ["health-metrics-summary"],
    queryFn: async () => {
      const res = await axios.get("/api/health-metrics/summary");
      return res.data;
    },
  });

  // Health Data Records Table - fetch from /api/health-metrics/recent
  const { data: recentMetrics, isLoading: recentMetricsLoading, isError: recentMetricsError } = useQuery({
    queryKey: ["recent-health-metrics"],
    queryFn: async () => {
      const res = await axios.get("/api/health-metrics/recent");
      return res.data;
    },
  });

  // Recent Trends - fetch from /api/analytics/recent-trends
  const { data: trendsData, isLoading: trendsLoading, isError: trendsError } = useQuery({
    queryKey: ["recent-trends"],
    queryFn: async () => {
      const res = await axios.get("/api/analytics/recent-trends");
      return res.data;
    },
  });

  // Prepare chart data: group by date, each type as a line
  const chartData = React.useMemo(() => {
    if (!Array.isArray(trendsData)) return [];
    // Get all unique dates
    const dates = Array.from(new Set(trendsData.map((d: any) => d.date))).sort();
    // Build a row for each date
    return dates.map(date => {
      const row: any = { date };
      trendsData.forEach((d: any) => {
        if (d.date === date) {
          row[d.type] = d.average;
        }
      });
      return row;
    });
  }, [trendsData]);

  const isLoading = usersLoading || patientsLoading || appointmentsLoading || alertsLoading || statsLoading || healthLoading || activitiesLoading;
  const isError = usersError || patientsError || appointmentsError || alertsError || statsError || healthError || activitiesError;

  // Calculate stats from real data
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const activeUsers = Array.isArray(users) ? users.filter(u => u.isActive).length : 0;
  const totalPatients = Array.isArray(patients) ? patients.length : 0;
  const totalAppointments = Array.isArray(appointments) ? appointments.length : 0;
  const unreadAlerts = Array.isArray(alerts) ? alerts.filter(a => !a.read).length : 0;
  const highRiskPatients = Array.isArray(patients) ? patients.filter(p => p.riskLevel === "high" || p.riskLevel === "critical").length : 0;

  // When mapping/filtering users, ensure user.role is treated as string
  const getRoleCount = (role: UserRole) => Array.isArray(users) ? users.filter((u: any) => String(u.role) === role).length : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <Skeleton className="w-8 h-8" />
          <span className="ml-4 text-slate-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-red-500">
          Failed to load dashboard data.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-600">System overview and analytics</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSwitchRole}
            className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Switch Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-slate-600">
              {activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-slate-600">
              {highRiskPatients} high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-slate-600">
              Total scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadAlerts}</div>
            <p className="text-xs text-slate-600">
              Require attention
            </p>
          </CardContent>
        </Card>

        {/* Average Glucose Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Glucose</CardTitle>
            <Droplet className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            {avgGlucoseLoading ? (
              <div className="text-slate-500">Loading...</div>
            ) : avgGlucoseError ? (
              <div className="text-red-500">Error loading</div>
            ) : (
              <div className="text-2xl font-bold">
                {avgGlucoseData && typeof avgGlucoseData.averageGlucose === 'number' && !isNaN(avgGlucoseData.averageGlucose)
                  ? `${avgGlucoseData.averageGlucose.toFixed(1)} mg/dL`
                  : "N/A"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Avg. glucose level across all patients
            </p>
          </CardContent>
        </Card>

        {/* Health Metrics Summary Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Metrics Summary</CardTitle>
            <HeartPulse className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            {metricsSummaryLoading ? (
              <div className="text-slate-500">Loading...</div>
            ) : metricsSummaryError ? (
              <div className="text-red-500">Error loading</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. Glucose</span>
                  <span className="font-semibold">
                    {metricsSummary && typeof metricsSummary.averageGlucose === 'number' && !isNaN(metricsSummary.averageGlucose)
                      ? `${metricsSummary.averageGlucose.toFixed(1)} mg/dL`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. Systolic BP</span>
                  <span className="font-semibold">
                    {metricsSummary && typeof metricsSummary.averageSystolicBP === 'number' && !isNaN(metricsSummary.averageSystolicBP)
                      ? `${metricsSummary.averageSystolicBP.toFixed(0)} mmHg`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. Diastolic BP</span>
                  <span className="font-semibold">
                    {metricsSummary && typeof metricsSummary.averageDiastolicBP === 'number' && !isNaN(metricsSummary.averageDiastolicBP)
                      ? `${metricsSummary.averageDiastolicBP.toFixed(0)} mmHg`