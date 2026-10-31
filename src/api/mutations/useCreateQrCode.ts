import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QrCode, QrInput } from "../../features/qr/types";
import { api } from "../instance";

export const useCreateQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: QrInput) => {
      const { data } = await api.post<QrCode>("/qr-codes", input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qr-codes"] }),
  });
};
