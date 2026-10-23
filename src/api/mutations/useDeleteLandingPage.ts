import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../instance";

export const useDeleteLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/landing-pages/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["landing-pages"] }),
  });
};
