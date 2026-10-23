import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../instance";

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/integrations/${id}`);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};
