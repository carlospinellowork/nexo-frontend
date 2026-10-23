import { useQuery } from "@tanstack/react-query";
import { api } from "../instance";

export interface AiStatus {
  configured: boolean;
  model: string;
}

export const useGetAiStatus = () =>
  useQuery({
    queryKey: ["ai-status"],
    queryFn: async () => {
      const { data } = await api.get<AiStatus>("/ai/status");
      return data;
    },
    staleTime: 5 * 60_000,
  });
