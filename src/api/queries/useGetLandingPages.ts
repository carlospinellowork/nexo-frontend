import { useQuery } from "@tanstack/react-query";
import type { LandingPageRecord } from "../../features/landing/contract";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export const useGetLandingPages = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["landing-pages", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<LandingPageRecord[]>("/landing-pages");
      return data;
    },
    enabled: !!workspaceId,
  });
};
