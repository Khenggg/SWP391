import { useMutation, useQueryClient } from "@tanstack/react-query";
import { licensePlateMismatchService } from "../services/licensePlateMismatchService";
import { toast } from "sonner";

export const useSubmitLicensePlateMismatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => licensePlateMismatchService.submitMismatch(data),
    onSuccess: () => {
      toast.success("License Plate Mismatch Request Submitted Successfully");
      queryClient.invalidateQueries({ queryKey: ["licensePlateMismatch"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit request.");
    },
  });
};
