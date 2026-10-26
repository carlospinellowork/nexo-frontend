import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  channel: string;
  data: Record<string, string>;
  chat: { id: string; name: string } | null;
  createdAt: string;
  lastContactAt: string;
}

export const useGetLeads = (q: string) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["leads", workspaceId, q],
    queryFn: async () => {
      const { data } = await api.get<Lead[]>("/leads", { params: q ? { q } : {} });
      return data;
    },
    enabled: !!workspaceId,
    placeholderData: (prev) => prev,
  });
};
