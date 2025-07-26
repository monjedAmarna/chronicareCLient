import { useQuery } from "@tanstack/react-query";
import { mockApiFunctions } from "@/mocks/patientData";
import type { Alert } from "@/api/alerts.api";

export function useAlertsQuery() {
  return useQuery<Alert[], Error>({
    queryKey: ["alerts"],
    queryFn: mockApiFunctions.getAlerts,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
  });
} 