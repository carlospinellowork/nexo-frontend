import { useQuery } from "@tanstack/react-query";
import { api } from "../instance";

export interface ChannelStatus {
  publicUrl: string;
  webhooksReady: boolean;
  telegramMode: "webhook" | "polling";
  metaConfigured: boolean;
  metaWebhookUrl: string;
}

export const useGetChannelStatus = () => {
  return useQuery({
    queryKey: ["channel-status"],
    queryFn: async () => {
      const { data } = await api.get<ChannelStatus>("/channels/status");
      return data;
    },
    staleTime: 60_000,
  });
};
