import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatSettings } from "../../features/chatBuilder/store/chat-builder-store";
import type { Chat } from "../queries/useGetChats";
import { api } from "../instance";

interface PatchChatPayload {
  id: string;
  name?: string;
  settings?: Partial<ChatSettings>;
}

export const usePatchChatSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, settings }: PatchChatPayload) => {
      const { data } = await api.patch<Chat>(`/chats/${id}`, { name, settings });
      return data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
