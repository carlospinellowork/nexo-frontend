import { useQuery } from "@tanstack/react-query";
import type { AgendaData } from "../../features/agenda/types";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** Configuração, serviços e bloqueios da agenda do workspace. */
export const useGetAgenda = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["agenda", workspaceId],
    queryFn: async () => (await api.get<AgendaData>("/agenda")).data,
    enabled: !!workspaceId,
  });
};
