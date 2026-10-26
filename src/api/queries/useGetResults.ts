import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export interface Results {
  days: number;
  conversations: number;
  completed: number;
  handoffs: number;
  abandoned: number;
  leads: number;
  /** Concluídas ou transferidas sobre as encerradas; null sem conversas. */
  completionRate: number | null;
  perDay: { date: string; count: number }[];
  byChannel: Record<string, number>;
  dropOff: { chat: string; nodeId: string; label: string; count: number }[];
}

export const useGetResults = (days: number) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["results", workspaceId, days],
    queryFn: async () => {
      const { data } = await api.get<Results>("/results", { params: { days } });
      return data;
    },
    enabled: !!workspaceId,
    placeholderData: (prev) => prev,
  });
};
