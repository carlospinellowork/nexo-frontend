import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export interface LandingClickStats {
  items: Record<string, { last7: number; last30: number }>;
}

/** Cliques por item (últimos 7 e 30 dias) da página do workspace ativo. */
export const useGetLandingClicks = (pageId: string | undefined) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["landing-clicks", workspaceId, pageId],
    queryFn: async () => {
      const { data } = await api.get<LandingClickStats>(`/landing-pages/${pageId}/clicks`);
      return data;
    },
    enabled: !!workspaceId && !!pageId,
  });
};
