import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LandingPageRecord, LandingTheme } from "../../features/landing/contract";
import { api } from "../instance";

export interface CreateLandingPagePayload {
  title: string;
  theme?: LandingTheme;
  description?: string;
  chatId?: string | null;
  /** A IA escreve a página a partir da descrição. */
  useAi?: boolean;
}

export const useCreateLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ useAi, ...payload }: CreateLandingPagePayload) => {
      const { data } = await api.post<LandingPageRecord & { aiUsed: boolean }>(useAi ? "/landing-pages/generate" : "/landing-pages", payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["landing-pages"] }),
  });
};
