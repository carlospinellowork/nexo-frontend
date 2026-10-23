import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Workspace } from "../queries/useGetWorkspaces";
import { api } from "../instance";

export const usePostWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<Workspace>("/workspaces", { name });
      return data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
