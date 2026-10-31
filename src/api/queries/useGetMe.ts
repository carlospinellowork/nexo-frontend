import { useQuery } from "@tanstack/react-query";
import type { Me } from "../../features/profile/types";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** A pessoa (avatar, se já fez o "conhecer você") e o perfil do negócio do workspace ativo. */
export const useGetMe = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["me", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Me>("/me");
      return data;
    },
    staleTime: 5 * 60_000,
  });
};
