import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Bell, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Activity
} from "lucide-react";

// --- Mock Data ---
const initialAlerts = [
  {
    id: "a1",
    type: "vital",
    severity: "critical",
    patientName: "John Doe",
    message: "Critical blood pressure detected!",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "a2",
    type: "medication",
    severity: "high",
    patientName: "Jane Smith",
    message: "Missed medication dose.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
  },
  {
    id: "a3",
    type: "appointment",
    severity: "medium",
    patientName: "Alice Brown",
    message: "Upcoming appointment tomorrow.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
  },
  {
    id: "a4",
    type: "vital",
    severity: "low",
    patientName: "Bob White",
    message: "Stable glucose reading.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: true,
  },
];

function getAlerts() {
  return Promise.resolve(alertsState);
}

// In-memory alerts state
let alertsState = JSON.parse(JSON.stringify(initialAlerts));

function markAlertAsRead(alertId) {
  const idx = alertsState.findIndex(a => a.id === alertId);
  if (idx !== -1) {
    alertsState[idx].read = true;
  }
  return Promise.resolve();
}

export default function DoctorAlerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [_, setForceUpdate] = useState(0); // for local state update

  // Fetch alerts (mocked)
  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ["alerts", "doctor"],
    queryFn: getAlerts,
  });

  // Mark alert as read (mocked)
  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId).then(() => setForceUpdate(x => x + 1));
  };

  // Filter alerts based on search and severity
  const filteredAlerts = React.useMemo(() => {
    if (!Array.isArray(alerts)) return [];
    return alerts.filter(alert => {
      const patientName = alert.patientName || '';
      const message = alert.message || '';
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = patientName.toLowerCase().includes(searchLower) ||
                           message.toLowerCase().includes(searchLower);
      const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchTerm, filterSeverity]);

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="py-12 text-center text-red-500">
          Failed to load alerts.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-slate-600">Monitor and manage patient alerts</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search alerts by patient or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{Array.isArray(alerts) ? alerts.length : 0}</p>
                <p className="text-sm text-slate-600">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center text-slate-500 py-12">No alerts found.</div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={getSeverityBadgeVariant(alert.severity)}>{alert.severity}</Badge>
                  <span className="capitalize">{alert.type?.replace("_", " ") || "Unknown"}</span>
                  <span className="text-xs text-slate-400">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "No timestamp"}
                  </span>
                  {!alert.read && (
                    <Button size="xs" variant="outline" onClick={() => handleMarkAsRead(alert.id)}>
                      Mark as Read
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  <span className="font-semibold">
                    {alert.patientName || "Unnamed Patient"}
                  </span> 
                  &mdash; {alert.message}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Future: Add actions like mark as read, acknowledge, etc. */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 