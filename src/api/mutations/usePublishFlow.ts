import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../instance";

/** Publica o rascunho salvo: a partir daí ele vale no site e nos canais. */
export const usePublishFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chatId: string) => {
      const { data } = await api.post(`/chats/${chatId}/flow/publish`);
      return data;
    },
    onSuccess: (_, chatId) => queryClient.invalidateQueries({ queryKey: ["flow"], predicate: (q) => q.queryKey.includes(chatId) }),
  });
};
