// Mock data for patient pages - replaces all API calls
import { Medication } from "@/api/medications.api";
import { HealthMetric } from "@/api/health.api";
import { CarePlan } from "@/api/careplans.api";
import { Alert } from "@/api/alerts.api";

// Mock Medications Data
export const mockMedications: Medication[] = [
  {
    id: "1",
    userId: "patient-1",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice a day",
    times: ["08:00", "20:00"],
    startDate: "2024-01-15",
    endDate: undefined,
    isActive: true,
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "patient-1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once a day",
    times: ["08:00"],
    startDate: "2024-02-01",
    endDate: undefined,
    isActive: true,
    status: "active",
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "3",
    userId: "patient-1",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once a day",
    times: ["20:00"],
    startDate: "2024-01-20",
    endDate: undefined,
    isActive: true,
    status: "active",
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "4",
    userId: "patient-1",
    name: "Aspirin",
    dosage: "81mg",
    frequency: "Once a day",
    times: ["08:00"],
    startDate: "2024-01-10",
    endDate: undefined,
    isActive: false,
    status: "paused",
    createdAt: "2024-01-10T10:00:00Z",
  },
];

// Mock Health Metrics Data
export const mockHealthMetrics: HealthMetric[] = [
  {
    id: 1,
    userId: "patient-1",
    type: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    recordedAt: "2024-03-15T08:00:00Z",
    notes: "Morning reading, normal range",
  },
  {
    id: 2,
    userId: "patient-1",
    type: "Glucose",
    value: "95",
    unit: "mg/dL",
    recordedAt: "2024-03-15T08:00:00Z",
    notes: "Fasting glucose, within target",
  },
  {
    id: 3,
    userId: "patient-1",
    type: "Weight",
    value: "75",
    unit: "kg",
    recordedAt: "2024-03-14T08:00:00Z",
    notes: "Weekly weight check",
  },
  {
    id: 4,
    userId: "patient-1",
    type: "Heart Rate",
    value: "72",
    unit: "bpm",
    recordedAt: "2024-03-15T08:00:00Z",
    notes: "Resting heart rate",
  },
  {
    id: 5,
    userId: "patient-1",
    type: "Temperature",
    value: "98.6",
    unit: "°F",
    recordedAt: "2024-03-15T08:00:00Z",
    notes: "Normal body temperature",
  },
  {
    id: 6,
    userId: "patient-1",
    type: "Blood Pressure",
    value: "118/78",
    unit: "mmHg",
    recordedAt: "2024-03-14T20:00:00Z",
    notes: "Evening reading",
  },
  {
    id: 7,
    userId: "patient-1",
    type: "Glucose",
    value: "110",
    unit: "mg/dL",
    recordedAt: "2024-03-14T20:00:00Z",
    notes: "Post-dinner reading",
  },
];

// Mock Care Plans Data
export const mockCarePlans: CarePlan[] = [
  {
    id: "1",
    userId: "patient-1",
    title: "Diabetes Management Plan",
    description: "Comprehensive plan for managing type 2 diabetes through diet, exercise, and medication",
    goals: [
      "Maintain blood glucose between 80-130 mg/dL",
      "Lose 5kg over 6 months",
      "Exercise 30 minutes daily",
      "Monitor blood pressure weekly"
    ],
    medications: ["Metformin", "Lisinopril"],
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    status: "active",
    progress: 65,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "patient-1",
    title: "Cardiovascular Health Plan",
    description: "Plan to improve heart health and reduce cardiovascular risk factors",
    goals: [
      "Reduce LDL cholesterol to below 100 mg/dL",
      "Maintain blood pressure below 140/90",
      "Increase physical activity to 150 minutes/week",
      "Quit smoking"
    ],
    medications: ["Atorvastatin", "Lisinopril"],
    startDate: "2024-02-01",
    endDate: "2024-08-01",
    status: "active",
    progress: 40,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "3",
    userId: "patient-1",
    title: "Weight Management Plan",
    description: "Structured plan for healthy weight loss and maintenance",
    goals: [
      "Achieve target weight of 70kg",
      "Reduce body fat percentage to 20%",
      "Improve muscle mass",
      "Establish healthy eating habits"
    ],
    medications: [],
    startDate: "2024-03-01",
    endDate: "2024-09-01",
    status: "active",
    progress: 25,
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
  },
];

// Mock Appointments Data
export const mockAppointments = [
  {
    id: "1",
    patientId: "patient-1",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Johnson",
    date: "2024-03-20",
    time: "10:00 AM",
    type: "Follow-up",
    status: "scheduled",
    notes: "Diabetes management review",
    location: "Main Clinic",
  },
  {
    id: "2",
    patientId: "patient-1",
    doctorId: "doctor-2",
    doctorName: "Dr. Michael Chen",
    date: "2024-03-25",
    time: "2:30 PM",
    type: "Consultation",
    status: "scheduled",
    notes: "Cardiovascular assessment",
    location: "Cardiology Department",
  },
  {
    id: "3",
    patientId: "patient-1",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Johnson",
    date: "2024-04-05",
    time: "9:00 AM",
    type: "Lab Work",
    status: "scheduled",
    notes: "Blood work and A1C test",
    location: "Laboratory",
  },
  {
    id: "4",
    patientId: "patient-1",
    doctorId: "doctor-3",
    doctorName: "Dr. Emily Rodriguez",
    date: "2024-03-10",
    time: "11:00 AM",
    type: "Follow-up",
    status: "completed",
    notes: "Weight management review - good progress",
    location: "Nutrition Department",
  },
];

// Mock Alerts Data
export const mockAlerts: Alert[] = [
  {
    id: "1",
    userId: "patient-1",
    type: "health_metric",
    title: "High Blood Pressure Reading",
    message: "Your blood pressure reading of 145/95 is above the recommended range",
    severity: "warning",
    status: "active",
    createdAt: "2024-03-15T08:30:00Z",
    readAt: null,
  },
  {
    id: "2",
    userId: "patient-1",
    type: "medication",
    title: "Medication Reminder",
    message: "Time to take your Metformin (500mg)",
    severity: "info",
    status: "active",
    createdAt: "2024-03-15T08:00:00Z",
    readAt: null,
  },
  {
    id: "3",
    userId: "patient-1",
    type: "appointment",
    title: "Upcoming Appointment",
    message: "You have an appointment with Dr. Johnson tomorrow at 10:00 AM",
    severity: "info",
    status: "active",
    createdAt: "2024-03-14T18:00:00Z",
    readAt: null,
  },
  {
    id: "4",
    userId: "patient-1",
    type: "health_metric",
    title: "Glucose Level Alert",
    message: "Your glucose reading of 140 mg/dL is above target range",
    severity: "warning",
    status: "active",
    createdAt: "2024-03-14T20:15:00Z",
    readAt: null,
  },
  {
    id: "5",
    userId: "patient-1",
    type: "care_plan",
    title: "Care Plan Update",
    message: "Your diabetes management plan has been updated with new goals",
    severity: "info",
    status: "read",
    createdAt: "2024-03-13T14:00:00Z",
    readAt: "2024-03-13T14:30:00Z",
  },
];

// Mock Health Summary Data
export const mockHealthSummary = {
  totalMetrics: 7,
  averageGlucose: 102.5,
  averageBloodPressure: "119/79",
  weightTrend: -2.5,
  medicationAdherence: 95,
  criticalAlerts: 0,
  healthAlerts: 2,
  lastUpdated: "2024-03-15T08:00:00Z",
  trends: {
    glucose: [95, 98, 102, 97, 105, 100, 95],
    bloodPressure: [120, 118, 122, 119, 121, 118, 120],
    weight: [77.5, 77.2, 76.8, 76.5, 76.1, 75.8, 75.0],
  },
};

// Mock functions to replace API calls
export const mockApiFunctions = {
  // Medications
  getMedications: () => Promise.resolve(mockMedications),
  createMedication: (data: any) => Promise.resolve({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }),
  updateMedication: (id: string, data: any) => Promise.resolve({ ...data, id, updatedAt: new Date().toISOString() }),
  deleteMedication: (id: string) => Promise.resolve({ success: true }),

  // Health Metrics
  getHealthMetrics: () => Promise.resolve(mockHealthMetrics),
  createHealthMetric: (data: any) => Promise.resolve({ ...data, id: Date.now(), recordedAt: new Date().toISOString() }),

  // Care Plans
  getCarePlans: () => Promise.resolve(mockCarePlans),
  createCarePlan: (data: any) => Promise.resolve({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }),
  updateCarePlan: (id: string, data: any) => Promise.resolve({ ...data, id, updatedAt: new Date().toISOString() }),
  deleteCarePlan: (id: string) => Promise.resolve({ success: true }),

  // Appointments
  getAppointments: () => Promise.resolve(mockAppointments),

  // Alerts
  getAlerts: () => Promise.resolve(mockAlerts),

  // Health Summary
  getPatientHealthSummary: () => Promise.resolve(mockHealthSummary),
}; 