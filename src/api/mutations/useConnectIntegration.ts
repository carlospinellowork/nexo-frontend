import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChannelType, Integration } from "../queries/useGetIntegrations";
import { api } from "../instance";

interface ConnectPayload {
  chatId: string;
  type: ChannelType;
  fields: Record<string, string>;
}

export const useConnectIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, type, fields }: ConnectPayload) => {
      const { data } = await api.post<Integration>(`/chats/${chatId}/integrations/${type}`, fields);
      return data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};
