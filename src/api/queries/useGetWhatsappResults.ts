import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** Quem foi para o WhatsApp: toques no WhatsApp da bio + conversas do bot que terminaram no botão do WhatsApp. */
export interface WhatsappResults {
  week: number;
  previous: number;
  fromBio: number;
  fromBot: number;
  today: number;
  perDay: { date: string; bio: number; bot: number; count: number }[];
}

export const useGetWhatsappResults = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["results", workspaceId, "whatsapp"],
    queryFn: async () => {
      const { data } = await api.get<WhatsappResults>("/results/whatsapp");
      return data;
    },
    enabled: !!workspaceId,
    refetchInterval: 60_000,
  });
};
