import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../instance";

export type ExampleTemplate = "barbearia" | "salao";

export interface ExampleResult {
  chatId: string;
  chatName: string;
  landingPageId: string;
  slug: string;
}

/** Cria uma empresa de exemplo: bot de agendamento publicado + landing page no ar. */
export const useCreateExample = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: ExampleTemplate) => {
      const { data } = await api.post<ExampleResult>("/examples", { template });
      return data;
    },
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: ["chats"] }), queryClient.invalidateQueries({ queryKey: ["landing-pages"] })]),
  });
};
