import { useQuery } from "@tanstack/react-query";
import type { ChatSettings } from "../../features/chatBuilder/store/chat-builder-store";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export interface Chat {
  id: string;
  name: string;
  settings: Partial<ChatSettings>;
  createdAt: string;
}

export const useGetChats = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["chats", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Chat[]>("/chats");
      return data;
    },
    enabled: !!workspaceId,
  });
};
