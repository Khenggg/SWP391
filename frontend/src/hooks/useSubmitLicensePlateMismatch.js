import { useMutation, useQueryClient } from "@tanstack/react-query";
import { licensePlateMismatchService } from "../services/licensePlateMismatchService";
import { toast } from "sonner";

// Staff: submit new mismatch report
export const useSubmitLicensePlateMismatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => licensePlateMismatchService.submitMismatch(data),
    onSuccess: (_, variables) => {
      toast.success("Đã gửi yêu cầu báo cáo lệch biển số thành công.");
      // Invalidate the status query so exit page re-fetches immediately
      queryClient.invalidateQueries({ queryKey: ["mismatchStatus", variables?.sessionId] });
    },
    onError: (error) => {
      toast.error(error?.message || "Gửi yêu cầu thất bại.");
    },
  });
};

// Manager: approve a mismatch case
export const useApproveMismatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => licensePlateMismatchService.approveMismatch(data),
    onSuccess: () => {
      toast.success("Đã phê duyệt hồ sơ lệch biển số.");
      queryClient.invalidateQueries({ queryKey: ["mismatchCases"] });
      queryClient.invalidateQueries({ queryKey: ["mismatchCaseDetail"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Phê duyệt thất bại.");
    },
  });
};

// Manager: reject a mismatch case
export const useRejectMismatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => licensePlateMismatchService.rejectMismatch(data),
    onSuccess: () => {
      toast.success("Đã từ chối hồ sơ lệch biển số.");
      queryClient.invalidateQueries({ queryKey: ["mismatchCases"] });
      queryClient.invalidateQueries({ queryKey: ["mismatchCaseDetail"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Từ chối thất bại.");
    },
  });
};
