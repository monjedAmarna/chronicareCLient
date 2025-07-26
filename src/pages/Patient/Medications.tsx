import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Pill, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApiFunctions } from "@/mocks/patientData";
import type { Medication } from "@/api/medications.api";

// Add these options at the top, matching the doctor's form
const statusOptions = ["active", "paused", "completed"];
const frequencyOptions = [
  "Once a day",
  "Twice a day",
  "Every 8 hours",
  "Before meals",
  "After meals",
  "As needed",
];
const dosageOptions = [
  "250mg",
  "500mg",
  "1 tablet",
  "2 tablets",
  "5ml",
  "10ml",
];

// Form validation schema
const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.enum([
    "250mg",
    "500mg",
    "1 tablet",
    "2 tablets",
    "5ml",
    "10ml",
  ], { errorMap: () => ({ message: "Dosage is required" }) }),
  frequency: z.enum([
    "Once a day",
    "Twice a day",
    "Every 8 hours",
    "Before meals",
    "After meals",
    "As needed",
  ], { errorMap: () => ({ message: "Frequency is required" }) }),
  startDate: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "paused", "completed"], { errorMap: () => ({ message: "Status is required" }) }),
  notes: z.string().optional(),
  times: z.array(z.string()).optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

export default function Medications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  // Add state for times and newTime, like in the doctor's form
  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
  });

  const watchStatus = watch("status");

  // Fetch medications using mock function
  const { data: medications, isLoading, isError, error } = useQuery({
    queryKey: ["medications", user?.id],
    queryFn: mockApiFunctions.getMedications,
  });

  // Add medication using mock function
  const addMutation = useMutation({
    mutationFn: (data: MedicationFormData) => mockApiFunctions.createMedication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({ title: "Medication Added", description: `Medication has been added.` });
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to add medication.", variant: "destructive" });
    },
  });

  // Edit medication using mock function
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicationFormData }) => mockApiFunctions.updateMedication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({ title: "Medication Updated", description: `Medication has been updated.` });
      setEditingMedication(null);
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update medication.", variant: "destructive" });
    },
  });

  // Delete medication using mock function
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockApiFunctions.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", user?.id] });
      toast({ title: "Medication Removed", description: `Medication has been removed.` });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to remove medication.", variant: "destructive" });
    },
  });

  // Add handlers for times
  const handleAddTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime]);
      setNewTime("");
    }
  };
  const handleRemoveTime = (time: string) => {
    setTimes(times.filter(t => t !== time));
  };

  // Handle form submission
  const onSubmit = (data: MedicationFormData) => {
    if (editingMedication) {
      editMutation.mutate({ id: editingMedication.id, data: { ...data, times } });
    } else {
      addMutation.mutate({ ...data, times });
    }
  };

  // Open edit dialog
  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setValue("name", medication.name);
    setValue("dosage", medication.dosage as any);
    setValue("frequency", medication.frequency as any);
    setValue("startDate", medication.startDate);
    setValue("status", (medication.status || "active") as any);
    setValue("notes", medication.notes || "");
    setIsAddDialogOpen(true);
  };

  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingMedication(null);
    reset();
    setTimes([]);
    setNewTime("");
  };

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "default";
      case "paused":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Safely format status for display
  const formatStatus = (status: string | undefined) => {
    if (!status || typeof status !== 'string') {
      return "Unknown";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
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
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Medications</h2>
        <p className="text-slate-600 mb-4">Failed to load your medications. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medications</h1>
          <p className="text-slate-600">Manage your medications and dosages</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMedication ? "Edit Medication" : "Add New Medication"}
              </DialogTitle>
              <DialogDescription>
                {editingMedication
                  ? "Update your medication information"
                  : "Add a new medication to your list"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Metformin"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Select onValueChange={(value) => setValue("dosage", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dosage" />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageOptions.map((dosage) => (
                        <SelectItem key={dosage} value={dosage}>
                          {dosage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dosage && (
                    <p className="text-sm text-red-500">{errors.dosage.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select onValueChange={(value) => setValue("frequency", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.frequency && (
                    <p className="text-sm text-red-500">{errors.frequency.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              {/* Times input for medications that need specific times */}
              {watchStatus === "active" && (
                <div className="space-y-2">
                  <Label>Reminder Times</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="Add time"
                    />
                    <Button type="button" onClick={handleAddTime} variant="outline">
                      Add
                    </Button>
                  </div>
                  {times.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {times.map((time) => (
                        <Badge key={time} variant="secondary" className="flex items-center gap-1">
                          {time}
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(time)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  {...register("notes")}
                  placeholder="Additional notes about this medication"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addMutation.isPending || editMutation.isPending}>
                  {addMutation.isPending || editMutation.isPending ? "Saving..." : editingMedication ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Medications Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications && medications.length > 0 ? (
              medications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Pill className="w-4 h-4 text-blue-500" />
                      <span>{medication.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell>{medication.frequency}</TableCell>
                  <TableCell>{formatDate(medication.startDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(medication.status)}>
                      {formatStatus(medication.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(medication)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Medication</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {medication.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(medication.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Pill className="w-12 h-12 text-slate-300" />
                    <p className="text-slate-500">No medications found</p>
                    <p className="text-sm text-slate-400">Add your first medication to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Medication Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Medication Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Take medications at the same time each day for better adherence</li>
          <li>• Set reminders on your phone for medication times</li>
          <li>• Keep a medication log to track any side effects</li>
          <li>• Always consult your doctor before stopping any medication</li>
        </ul>
      </div>
    </div>
  );
} 