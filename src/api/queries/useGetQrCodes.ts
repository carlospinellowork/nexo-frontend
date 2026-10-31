import { useQuery } from "@tanstack/react-query";
import type { QrCode } from "../../features/qr/types";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** QR Codes do workspace ativo, do mais novo para o mais antigo, com as leituras de 7 e 30 dias. */
export const useGetQrCodes = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["qr-codes", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<{ items: QrCode[] }>("/qr-codes");
      return data.items;
    },
    enabled: !!workspaceId,
  });
};
