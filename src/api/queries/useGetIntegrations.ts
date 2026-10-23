import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export type ChannelType = "whatsapp" | "instagram" | "telegram";

export interface Integration {
  id: string;
  chatId: string;
  type: ChannelType;
  name: string;
  externalId: string;
  config: Record<string, string>;
  createdAt: string;
}

export const useGetIntegrations = (chatId: string | null) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["integrations", workspaceId, chatId],
    queryFn: async () => {
      const { data } = await api.get<Integration[]>(`/chats/${chatId}/integrations`);
      return data;
    },
    enabled: !!chatId && !!workspaceId,
  });
};
