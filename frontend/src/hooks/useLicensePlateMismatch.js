import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { licensePlateMismatchService } from "../services/licensePlateMismatchService";
import { toast } from "sonner";

// Staff: poll mismatch status by parking session id
// staleTime: 0 + refetchOnMount: 'always' ensures the latest approval/rejection
// is always fetched from the backend — never served from cache.
export const useMismatchStatus = (parkingSessionId) => {
  return useQuery({
    queryKey: ["mismatchStatus", parkingSessionId],
    queryFn: () => licensePlateMismatchService.getMismatchStatus(parkingSessionId),
    enabled: !!parkingSessionId,
    refetchInterval: 10000,   // poll every 10s so staff sees manager decision live
    staleTime: 0,             // always treat cached data as stale
    refetchOnMount: "always", // always refetch when component mounts/returns to page
    retry: 1,
  });
};

// Manager: list all mismatch cases
export const useMismatchCases = (params) => {
  return useQuery({
    queryKey: ["mismatchCases", params],
    queryFn: () => licensePlateMismatchService.getMismatchCases(params),
    staleTime: 30000,
    retry: 1,
  });
};

// Manager: get detail for one case
export const useMismatchCaseDetail = (id) => {
  return useQuery({
    queryKey: ["mismatchCaseDetail", id],
    queryFn: () => licensePlateMismatchService.getMismatchCaseDetail(id),
    enabled: !!id,
    retry: 1,
    staleTime: 10000,
  });
};

// Legacy – kept for backward compatibility (staff submit page)
export const useLicensePlateMismatch = (parkingSessionId) => {
  return useMismatchStatus(parkingSessionId);
};
