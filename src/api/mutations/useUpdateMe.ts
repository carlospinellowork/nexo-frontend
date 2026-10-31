import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Me, UpdateMe } from "../../features/profile/types";
import { api } from "../instance";

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateMe) => {
      const { data } = await api.put<Me>("/me", input);
      return data;
    },
    // O nome do workspace pode ter virado o nome da marca.
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: ["me"] }), queryClient.invalidateQueries({ queryKey: ["workspaces"] })]),
  });
};
