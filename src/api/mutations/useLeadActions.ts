import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../instance";

export const useResolveHandoff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.post(`/handoffs/${sessionId}/resolve`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["handoffs"] }),
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/leads/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
};

/** Baixa o CSV dos leads (precisa do cookie e do workspace, por isso não é um link direto). */
export const useExportLeads = () =>
  useMutation({
    mutationFn: async () => {
      const { data } = await api.get<Blob>("/leads/export", { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
