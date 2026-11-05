import { useQuery } from "@tanstack/react-query";
import type { Booking } from "../../features/agenda/types";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { api } from "../instance";

/** Reservas de vários dias (`to` inclusive), para o calendário e a semana no computador. */
export const useGetBookingsRange = (from: string, to: string) => {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["bookings", workspaceId, from, to],
    queryFn: async () => (await api.get<Booking[]>("/agenda/bookings/range", { params: { from, to } })).data,
    enabled: !!workspaceId,
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  });
};
