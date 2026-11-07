import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

export interface Results {
  days: number;
  conversations: number;
  completed: number;
  handoffs: number;
  abandoned: number;
  leads: number;
  /** Concluídas ou transferidas sobre as encerradas; null sem conversas. */
  completionRate: number | null;
  perDay: { date: string; count: number }[];
  byChannel: Record<string, number>;
  dropOff: { chat: string; nodeId: string; label: string; count: number }[];
  /** Por bio em modo jornada: quem respondeu, quem chegou ao fim e quem tocou no WhatsApp. */
  journeys: { pageId: string; title: string; started: number; finished: number; whatsapp: number }[];
  /** Clientes por origem: visitas à bio, conversas, idas ao WhatsApp e reservas, por de onde a pessoa veio. */
  byOrigin: OriginRow[];
  /** Reservas e previsto de cada pessoa da equipe no período; vazio sem equipe. */
  byStaff?: { name: string; bookings: number; revenueCents: number }[];
}

export interface OriginRow {
  origin: string;
  visits: number;
  conversations: number;
  whatsapp: number;
  bookings: number;
}

export const useGetResults = (days: number) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["results", workspaceId, days],
    queryFn: async () => {
      const { data } = await api.get<Results>("/results", { params: { days } });
      return data;
    },
    enabled: !!workspaceId,
    placeholderData: (prev) => prev,
  });
};
