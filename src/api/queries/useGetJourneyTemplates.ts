import { useQuery } from "@tanstack/react-query";
import type { JourneyTemplate } from "../../features/bio/journey";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** Modelos de jornada, já com o nome, as perguntas, os produtos e o WhatsApp da bio. */
export const useGetJourneyTemplates = (pageId: string, enabled: boolean) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["journey-templates", workspaceId, pageId],
    queryFn: async () => {
      const { data } = await api.get<{ templates: JourneyTemplate[] }>(`/bio/${pageId}/journey-templates`);
      return data.templates;
    },
    enabled: enabled && !!workspaceId,
    // Muda com os links e as perguntas da bio: sempre busca de novo ao abrir a escolha.
    gcTime: 0,
  });
};
