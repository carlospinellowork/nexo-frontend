import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../instance";

export const useDeleteQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/qr-codes/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qr-codes"] }),
  });
};
