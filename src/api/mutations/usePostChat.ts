import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Chat } from "../queries/useGetChats";
import { api } from "../instance";

export const usePostChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<Chat>("/chats", { name });
      return data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
