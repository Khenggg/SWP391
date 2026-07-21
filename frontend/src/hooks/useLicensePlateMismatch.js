import { useQuery } from "@tanstack/react-query";
import { licensePlateMismatchService } from "../services/licensePlateMismatchService";

export const useLicensePlateMismatch = (parkingSessionId) => {
  return useQuery({
    queryKey: ["licensePlateMismatch", parkingSessionId],
    queryFn: () => licensePlateMismatchService.getDetails(parkingSessionId),
    enabled: !!parkingSessionId,
  });
};
