import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatSettings } from "../../features/chatBuilder/store/chat-builder-store";
import { api } from "../instance";

interface PatchChatPayload {
  id: string;
  settings: Partial<ChatSettings>;
}

export const usePatchChatSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, settings }: PatchChatPayload) => {
      const { data } = await api.patch<ChatSettings>(`/chats/${id}`, { settings });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
