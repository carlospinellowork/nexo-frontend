import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AgendaBlock, AgendaConfig, AgendaServiceItem, Booking } from "../../features/agenda/types";
import { api } from "../instance";

const useRefresh = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["agenda"] });
};

export const useUpdateAgenda = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<AgendaConfig, "hours" | "autoConfirm" | "stepMinutes" | "minNoticeMinutes">>) => (await api.put<AgendaConfig>("/agenda", patch)).data,
    onSuccess: refresh,
  });
};

export const useSaveAgendaService = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id?: string; name?: string; durationMinutes?: number; active?: boolean; priceCents?: number | null; description?: string | null; imageUrl?: string | null; icon?: string | null; iconMotion?: string | null }) =>
      (id ? await api.patch<AgendaServiceItem>(`/agenda/services/${id}`, data) : await api.post<AgendaServiceItem>("/agenda/services", data)).data,
    onSuccess: refresh,
  });
};

export const useDeleteAgendaService = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/agenda/services/${id}`),
    onSuccess: refresh,
  });
};

export const useCreateAgendaBlock = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (data: { from: string; to: string; reason?: string }) => (await api.post<{ block: AgendaBlock; conflicts: number }>("/agenda/blocks", data)).data,
    onSuccess: refresh,
  });
};

export const useDeleteAgendaBlock = () => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/agenda/blocks/${id}`),
    onSuccess: refresh,
  });
};

export const useBookingAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "confirm" | "cancel" }) => (await api.post<Booking>(`/agenda/bookings/${id}/${action}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { serviceId: string; date: string; time: string; customerName: string; customerPhone?: string; note?: string }) => (await api.post<Booking>("/agenda/bookings", data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => (await api.patch<Booking>(`/agenda/bookings/${id}`, { date, time })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
};
