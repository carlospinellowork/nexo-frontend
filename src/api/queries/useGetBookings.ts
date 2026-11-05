import { useQuery } from "@tanstack/react-query";
import type { Booking } from "../../features/agenda/types";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** Reservas de um dia. Atualiza sozinha enquanto a tela está aberta: é onde o dono acompanha o dia. */
export const useGetBookings = (date: string) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["bookings", workspaceId, date],
    queryFn: async () => (await api.get<Booking[]>("/agenda/bookings", { params: { date } })).data,
    enabled: !!workspaceId,
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  });
};
