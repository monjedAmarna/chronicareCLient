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
import { Plus, Edit, Trash2, Pill, Calendar, Clock, AlertTriangle, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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

type Patient = {
  id: string;
  name: string;
};

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  status: string;
  notes?: string;
  times?: string[];
};

// --- Mock Data ---
const mockPatients: Patient[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Alice Brown" },
];

const initialMedications: Record<string, Medication[]> = {
  "1": [
    {
      id: "m1",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once a day",
      startDate: "2024-06-01",
      status: "active",
      notes: "Take in the morning",
      times: ["08:00"],
    },
    {
      id: "m2",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice a day",
      startDate: "2024-05-15",
      status: "active",
      notes: "With meals",
      times: ["08:00", "20:00"],
    },
  ],
  "2": [
    {
      id: "m3",
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once a day",
      startDate: "2024-06-05",
      status: "paused",
      notes: "Take at night",
      times: ["22:00"],
    },
  ],
  "3": [],
};

// --- Mock API Functions ---
function getAssignedPatients() {
  return Promise.resolve(mockPatients);
}

function getMedications(patientId: string) {
  return Promise.resolve(medicationsState[patientId] || []);
}

// --- In-memory medications state ---
let medicationsState: Record<string, Medication[]> = JSON.parse(JSON.stringify(initialMedications));

function createMedication(data: MedicationFormData & { patientId: string }) {
  const newMed: Medication = {
    id: `m${Math.random().toString(36).slice(2, 9)}`,
    ...data,
  };
  if (!medicationsState[data.patientId]) {
    medicationsState[data.patientId] = [];
  }
  medicationsState[data.patientId].push(newMed);
  return Promise.resolve(newMed);
}

function updateMedication(id: string, data: MedicationFormData) {
  for (const patientId in medicationsState) {
    const idx = medicationsState[patientId].findIndex(m => m.id === id);
    if (idx !== -1) {
      medicationsState[patientId][idx] = { ...medicationsState[patientId][idx], ...data };
      return Promise.resolve(medicationsState[patientId][idx]);
    }
  }
  return Promise.reject(new Error("Medication not found"));
}

function deleteMedication(id: string) {
  for (const patientId in medicationsState) {
    const idx = medicationsState[patientId].findIndex(m => m.id === id);
    if (idx !== -1) {
      medicationsState[patientId].splice(idx, 1);
      return Promise.resolve();
    }
  }
  return Promise.reject(new Error("Medication not found"));
}

export default function DoctorMedications() {
  const { user } = useAuth();
  const { toast } = useToast();
  // const queryClient = useQueryClient();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
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

  // Fetch patients assigned to the doctor (mocked)
  const { data: assignedPatients, isLoading: patientsLoading } = useQuery({
    queryKey: ["doctor-patients", user?.id],
    queryFn: getAssignedPatients,
    enabled: true,
  });

  // Fetch medications for selected patient (mocked)
  const { data: medications, isLoading: medicationsLoading, isError, error, refetch } = useQuery({
    queryKey: ["medications", selectedPatientId],
    queryFn: () => getMedications(selectedPatientId),
    enabled: !!selectedPatientId && selectedPatientId !== "loading" && selectedPatientId !== "none",
  });

  // Add medication (mocked)
  const addMutation = {
    isPending: false,
    mutate: (data: MedicationFormData & { patientId: string }) => {
      createMedication(data).then(() => {
        toast({ title: "Medication Added", description: `Medication has been added for the patient.` });
        setIsAddDialogOpen(false);
        reset();
        refetch();
      });
    },
  };

  // Edit medication (mocked)
  const editMutation = {
    isPending: false,
    mutate: ({ id, data }: { id: string; data: MedicationFormData }) => {
      updateMedication(id, data).then(() => {
        toast({ title: "Medication Updated", description: `Medication has been updated.` });
        setEditingMedication(null);
        setIsAddDialogOpen(false);
        reset();
        refetch();
      });
    },
  };

  // Delete medication (mocked)
  const deleteMutation = {
    mutate: (id: string) => {
      deleteMedication(id).then(() => {
        toast({ title: "Medication Removed", description: `Medication has been removed.` });
        refetch();
      });
    },
  };

  // Add time to times array
  const handleAddTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime]);
      setNewTime("");
    }
  };

  // Remove time from times array
  const handleRemoveTime = (time: string) => {
    setTimes(times.filter(t => t !== time));
  };

  // Handle form submission
  const onSubmit = (data: MedicationFormData) => {
    if (editingMedication) {
      editMutation.mutate({ id: editingMedication.id, data });
    } else {
      addMutation.mutate({
        ...data,
        patientId: selectedPatientId,
        times,
        isActive: true,
        endDate: null,
      });
    }
  };

  // Open edit dialog
  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setValue("name", medication.name);
    setValue("dosage", medication.dosage);
    setValue("frequency", medication.frequency);
    setValue("startDate", medication.startDate);
    setValue("status", medication.status);
    setValue("notes", medication.notes || "");
    setIsAddDialogOpen(true);
  };

  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingMedication(null);
    reset();
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "paused": return "secondary";
      case "completed": return "outline";
      default: return "outline";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    if (patientId === "loading" || patientId === "none") return "Unnamed Patient";
    const patient = assignedPatients?.find((p: Patient) => p.id === patientId);
    return patient ? (patient.name || "Unnamed Patient") : "Unnamed Patient";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Patient Medications</h1>
        <Button 
          onClick={() => { setIsAddDialogOpen(true); reset(); setEditingMedication(null); }}
          disabled={!selectedPatientId || selectedPatientId === "loading" || selectedPatientId === "none"}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Medication
        </Button>
      </div>

      {/* Patient Selector */}
      <div className="mb-6">
        <Label htmlFor="patient-select" className="text-sm font-medium">
          Select Patient
        </Label>
        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
          <SelectTrigger className="w-full max-w-md mt-1">
            <SelectValue placeholder="Choose a patient to view their medications" />
          </SelectTrigger>
          <SelectContent>
            {patientsLoading ? (
              <SelectItem value="loading" disabled>Loading patients...</SelectItem>
            ) : !assignedPatients || assignedPatients.length === 0 ? (
              <SelectItem value="none" disabled>No patients assigned</SelectItem>
            ) : (
              assignedPatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name || "Unnamed Patient"}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Medications Table */}
      {!selectedPatientId || selectedPatientId === "loading" || selectedPatientId === "none" ? (
        <div className="py-12 text-center text-slate-500">
          <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>Please select a patient to view their medications</p>
        </div>
      ) : medicationsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Skeleton className="w-8 h-8" />
          <span className="ml-4 text-slate-500">Loading medications...</span>
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500">
          {error instanceof Error ? error.message : "Failed to load medications."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              Medications for {getPatientName(selectedPatientId)}
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(medications) && medications.length > 0 ? (
                medications.map((med: Medication) => (
                  <TableRow key={med.id}>
                    <TableCell>{med.name}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.frequency}</TableCell>
                    <TableCell>{formatDate(med.startDate)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(med.status)}>{med.status}</Badge>
                    </TableCell>
                    <TableCell>{med.notes}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEdit(med)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Medication</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {med.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(med.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500">
                    No medications found for this patient.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Medication Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedication ? "Edit Medication" : "Add Medication"}</DialogTitle>
            <DialogDescription>
              {editingMedication 
                ? "Update the medication details." 
                : `Enter the details for the new medication for ${getPatientName(selectedPatientId)}.`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Select value={watch("dosage") || ""} onValueChange={val => setValue("dosage", val as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dosage" />
                  </SelectTrigger>
                  <SelectContent>
                    {dosageOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dosage && <span className="text-xs text-red-500">{errors.dosage.message}</span>}
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={watch("frequency") || ""} onValueChange={val => setValue("frequency", val as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frequency && <span className="text-xs text-red-500">{errors.frequency.message}</span>}
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && <span className="text-xs text-red-500">{errors.startDate.message}</span>}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={watch("status") || ""} onValueChange={val => setValue("status", val as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <span className="text-xs text-red-500">{errors.status.message}</span>}
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" {...register("notes")} />
                {errors.notes && <span className="text-xs text-red-500">{errors.notes.message}</span>}
              </div>
              <div>
                <Label>Times (per day)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-32"
                  />
                  <Button type="button" onClick={handleAddTime} disabled={!newTime || times.includes(newTime)}>
                    Add Time
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {times.length === 0 && <span className="text-xs text-slate-400">No times added</span>}
                  {times.map(time => (
                    <span key={time} className="inline-flex items-center bg-slate-100 rounded px-2 py-1 text-xs">
                      {time}
                      <Button type="button" size="xs" variant="ghost" onClick={() => handleRemoveTime(time)} className="ml-1 px-1">
                        ×
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addMutation.isPending || editMutation.isPending}>
                {editingMedication ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 