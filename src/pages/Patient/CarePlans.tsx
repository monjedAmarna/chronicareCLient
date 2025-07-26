import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Heart, Calendar, Target, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApiFunctions } from "@/mocks/patientData";
import type { CarePlan } from "@/api/careplans.api";

// Form validation schema
const carePlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  goals: z.array(z.string()).min(1, "At least one goal is required"),
  medications: z.array(z.string()).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["active", "completed", "paused"], { errorMap: () => ({ message: "Status is required" }) }),
  progress: z.number().min(0).max(100),
});

type CarePlanFormData = z.infer<typeof carePlanSchema>;

export default function CarePlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCarePlan, setEditingCarePlan] = useState<CarePlan | null>(null);
  const [newGoal, setNewGoal] = useState("");
  const [newMedication, setNewMedication] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CarePlanFormData>({
    resolver: zodResolver(carePlanSchema),
  });

  const watchedGoals = watch("goals") || [];
  const watchedMedications = watch("medications") || [];

  // Fetch care plans using mock function
  const { data: carePlans, isLoading, isError, error } = useQuery({
    queryKey: ["care-plans", user?.id],
    queryFn: mockApiFunctions.getCarePlans,
  });

  // Add care plan using mock function
  const addMutation = useMutation({
    mutationFn: (data: CarePlanFormData) => mockApiFunctions.createCarePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans", user?.id] });
      toast({ title: "Care Plan Added", description: "Your care plan has been created." });
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to add care plan.", variant: "destructive" });
    },
  });

  // Edit care plan using mock function
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarePlanFormData }) => mockApiFunctions.updateCarePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans", user?.id] });
      toast({ title: "Care Plan Updated", description: "Your care plan has been updated." });
      setEditingCarePlan(null);
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update care plan.", variant: "destructive" });
    },
  });

  // Delete care plan using mock function
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockApiFunctions.deleteCarePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans", user?.id] });
      toast({ title: "Care Plan Removed", description: "Your care plan has been removed." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to remove care plan.", variant: "destructive" });
    },
  });

  const handleAddGoal = () => {
    if (newGoal.trim() && !watchedGoals.includes(newGoal.trim())) {
      setValue("goals", [...watchedGoals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setValue("goals", watchedGoals.filter(g => g !== goal));
  };

  const handleAddMedication = () => {
    if (newMedication.trim() && !watchedMedications.includes(newMedication.trim())) {
      setValue("medications", [...watchedMedications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setValue("medications", watchedMedications.filter(m => m !== medication));
  };

  const onSubmit = (data: CarePlanFormData) => {
    if (editingCarePlan) {
      editMutation.mutate({ id: editingCarePlan.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (carePlan: CarePlan) => {
    setEditingCarePlan(carePlan);
    setValue("title", carePlan.title);
    setValue("description", carePlan.description);
    setValue("goals", carePlan.goals);
    setValue("medications", carePlan.medications);
    setValue("startDate", carePlan.startDate);
    setValue("endDate", carePlan.endDate);
    setValue("status", carePlan.status);
    setValue("progress", carePlan.progress);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingCarePlan(null);
    reset();
    setNewGoal("");
    setNewMedication("");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "paused":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Care Plans</h2>
        <p className="text-slate-600 mb-4">Failed to load your care plans. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Care Plans</h1>
          <p className="text-slate-600">Manage your personalized health care plans</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Care Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCarePlan ? "Edit Care Plan" : "Create New Care Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingCarePlan
                  ? "Update your care plan information"
                  : "Create a personalized care plan for your health goals"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Care Plan Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Diabetes Management Plan"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your care plan and objectives"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Goals</Label>
                <div className="flex gap-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add a goal"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                  />
                  <Button type="button" onClick={handleAddGoal} variant="outline">
                    Add
                  </Button>
                </div>
                {watchedGoals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {watchedGoals.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {goal}
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(goal)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.goals && (
                  <p className="text-sm text-red-500">{errors.goals.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Medications (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add a medication"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                  />
                  <Button type="button" onClick={handleAddMedication} variant="outline">
                    Add
                  </Button>
                </div>
                {watchedMedications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {watchedMedications.map((medication, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {medication}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(medication)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    {...register("progress", { valueAsNumber: true })}
                  />
                  {errors.progress && (
                    <p className="text-sm text-red-500">{errors.progress.message}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addMutation.isPending || editMutation.isPending}>
                  {addMutation.isPending || editMutation.isPending ? "Saving..." : editingCarePlan ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Care Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carePlans && carePlans.length > 0 ? (
          carePlans.map((carePlan) => (
            <Card key={carePlan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-lg">{carePlan.title}</CardTitle>
                  </div>
                  <Badge variant={getStatusBadgeVariant(carePlan.status)}>
                    {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>{carePlan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{carePlan.progress}%</span>
                  </div>
                  <Progress value={carePlan.progress} className="h-2" />
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Goals</h4>
                  <div className="space-y-1">
                    {carePlan.goals.slice(0, 2).map((goal, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                        <Target className="w-3 h-3 text-blue-500" />
                        <span>{goal}</span>
                      </div>
                    ))}
                    {carePlan.goals.length > 2 && (
                      <p className="text-xs text-slate-500">+{carePlan.goals.length - 2} more goals</p>
                    )}
                  </div>
                </div>

                {carePlan.medications && carePlan.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Medications</h4>
                    <div className="flex flex-wrap gap-1">
                      {carePlan.medications.slice(0, 3).map((medication, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {medication}
                        </Badge>
                      ))}
                      {carePlan.medications.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{carePlan.medications.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{formatDate(carePlan.startDate)} - {formatDate(carePlan.endDate)}</span>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(carePlan)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Care Plan</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{carePlan.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(carePlan.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Care Plans Yet</h3>
            <p className="text-slate-500 mb-4">Create your first care plan to start managing your health goals</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Care Plan
            </Button>
          </div>
        )}
      </div>

      {/* Care Plan Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Care Plan Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Set specific, measurable goals for better tracking</li>
          <li>• Review and update your care plans regularly</li>
          <li>• Share your care plans with your healthcare team</li>
          <li>• Celebrate progress milestones to stay motivated</li>
        </ul>
      </div>
    </div>
  );
} 