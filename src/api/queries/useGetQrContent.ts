import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/**
 * Texto que vai dentro do QR. Só é usado no Wi-Fi (traz a senha da rede), por isso a rota exige Admin
 * e o resultado não fica guardado no cache depois que o detalhe fecha.
 */
export const useGetQrContent = (id: string | undefined, enabled = true) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["qr-codes", workspaceId, id, "content"],
    queryFn: async () => {
      const { data } = await api.get<{ content: string }>(`/qr-codes/${id}/content`);
      return data.content;
    },
    enabled: !!workspaceId && !!id && enabled,
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });
};
