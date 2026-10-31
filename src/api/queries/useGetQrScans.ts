import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** Leituras por dia dos últimos 30 dias de um QR Code dinâmico. */
export const useGetQrScans = (id: string | undefined, enabled = true) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["qr-codes", workspaceId, id, "scans"],
    queryFn: async () => {
      const { data } = await api.get<{ days: { day: string; count: number }[] }>(`/qr-codes/${id}/scans`);
      return data.days;
    },
    enabled: !!workspaceId && !!id && enabled,
  });
};
