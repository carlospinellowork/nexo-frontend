import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export interface Handoff {
  id: string;
  channel: string;
  chat: { id: string; name: string } | null;
  name: string | null;
  phone: string | null;
  since: string;
  /** Onde continuar a conversa (WhatsApp, Instagram); null quando o canal não permite. */
  replyUrl: string | null;
  messages: { from: "user" | "bot"; text: string }[];
}

/** Conversas que o bot transferiu para humano. Atualiza a cada 30 s. */
export const useGetHandoffs = () => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["handoffs", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Handoff[]>("/handoffs");
      return data;
    },
    enabled: !!workspaceId,
    refetchInterval: 30_000,
  });
};
