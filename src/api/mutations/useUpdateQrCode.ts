import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QrCode, QrInput } from "../../features/qr/types";
import { api } from "../instance";

/** Troca o nome ou o destino. O código (e o QR impresso) continua o mesmo. */
export const useUpdateQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: QrInput }) => {
      const { data } = await api.put<QrCode>(`/qr-codes/${id}`, input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qr-codes"] }),
  });
};
