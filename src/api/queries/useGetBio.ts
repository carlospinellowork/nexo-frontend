import { useQuery } from "@tanstack/react-query";
import type { LandingPageRecord } from "../../features/landing/contract";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** A bio do workspace ativo (a primeira página com layout "bio"), ou null se ainda não existe. */
export const useGetBio = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["bio", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<{ page: LandingPageRecord | null }>("/bio");
      return data.page;
    },
    enabled: !!workspaceId,
  });
};
