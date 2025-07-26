import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Activity, TrendingUp, Calendar, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApiFunctions } from "@/mocks/patientData";
import type { HealthMetric } from "@/api/health.api";

// Health metric types
const metricTypes = [
  "Blood Pressure",
  "Glucose",
  "Weight",
  "Heart Rate",
  "Temperature",
  "Oxygen Saturation",
  "Cholesterol",
  "BMI",
];

// Form validation schema
const healthMetricSchema = z.object({
  type: z.string().min(1, "Metric type is required"),
  value: z.string().min(1, "Value is required"),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

type HealthMetricFormData = z.infer<typeof healthMetricSchema>;

export default function HealthMetrics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HealthMetricFormData>({
    resolver: zodResolver(healthMetricSchema),
  });

  const watchedType = watch("type");

  // Fetch health metrics using mock function
  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ["health-metrics", user?.id],
    queryFn: mockApiFunctions.getHealthMetrics,
  });

  // Add health metric using mock function
  const addMutation = useMutation({
    mutationFn: (data: HealthMetricFormData) => mockApiFunctions.createHealthMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-metrics", user?.id] });
      toast({ title: "Health Data Added", description: "Your health metric has been recorded." });
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to add health metric.", variant: "destructive" });
    },
  });

  const onSubmit = (data: HealthMetricFormData) => {
    addMutation.mutate(data);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    reset();
  };

  // Get unit for metric type
  const getUnitForType = (type: string) => {
    switch (type) {
      case "Blood Pressure":
        return "mmHg";
      case "Glucose":
        return "mg/dL";
      case "Weight":
        return "kg";
      case "Heart Rate":
        return "bpm";
      case "Temperature":
        return "°F";
      case "Oxygen Saturation":
        return "%";
      case "Cholesterol":
        return "mg/dL";
      case "BMI":
        return "";
      default:
        return "";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Health Data</h2>
        <p className="text-slate-600 mb-4">Failed to load your health metrics. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Metrics</h1>
          <p className="text-slate-600">Track and monitor your health measurements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Health Data
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Health Metric</DialogTitle>
              <DialogDescription>
                Record a new health measurement
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Metric Type</Label>
                <Select onValueChange={(value) => setValue("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric type" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  {...register("value")}
                  placeholder={`Enter ${watchedType?.toLowerCase() || 'value'}`}
                />
                {errors.value && (
                  <p className="text-sm text-red-500">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit (Optional)</Label>
                <Input
                  id="unit"
                  {...register("unit")}
                  placeholder={watchedType ? getUnitForType(watchedType) : "Unit"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  {...register("notes")}
                  placeholder="Additional notes about this measurement"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Metric"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Health Metrics Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics && metrics.length > 0 ? (
              metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span>{metric.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold">{metric.value}</span>
                      {metric.unit && <span className="text-slate-500">{metric.unit}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{formatDate(metric.recordedAt || '')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{formatTime(metric.recordedAt || '')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {metric.notes ? (
                      <span className="text-sm text-slate-600">{metric.notes}</span>
                    ) : (
                      <span className="text-sm text-slate-400">No notes</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Activity className="w-12 h-12 text-slate-300" />
                    <p className="text-slate-500">No health data recorded yet</p>
                    <p className="text-sm text-slate-400">Add your first health measurement to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Health Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">Health Tracking Tips</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Measure at the same time each day for consistent tracking</li>
          <li>• Record your measurements immediately after taking them</li>
          <li>• Note any unusual readings or symptoms</li>
          <li>• Share your data with your healthcare provider regularly</li>
        </ul>
      </div>

      {/* Quick Stats */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-blue-800">Total Records</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{metrics.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-green-800">This Week</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {metrics.filter(m => {
                const date = new Date(m.recordedAt || '');
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-purple-800">Metric Types</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(metrics.map(m => m.type)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 