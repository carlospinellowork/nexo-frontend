import { useMutation } from "@tanstack/react-query";
import { api } from "../instance";

export const useSendFeedback = () =>
  useMutation({
    mutationFn: async (input: { rating?: number; message: string; page: string }) => {
      await api.post("/feedback", input);
    },
  });
