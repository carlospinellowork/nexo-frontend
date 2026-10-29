import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BioAudience, BioFaq } from "../../features/bio/presets";
import type { LandingPageRecord, LandingTheme, LinkItem, ProductItem } from "../../features/landing/contract";
import { api } from "../instance";

export interface CreateBioPayload {
  audience: BioAudience;
  name: string;
  handle?: string;
  tagline?: string;
  photoUrl?: string;
  theme: LandingTheme;
  links: LinkItem[];
  products: ProductItem[];
  faqs: { question: string; answer: string }[];
}

/** Criação guiada: o servidor cria bot e página e já publica os dois. */
export const useCreateBio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBioPayload) => {
      const { data } = await api.post<{ page: LandingPageRecord; aiUsed: boolean }>("/bio", payload);
      return data;
    },
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: ["bio"] }), queryClient.invalidateQueries({ queryKey: ["landing-pages"] }), queryClient.invalidateQueries({ queryKey: ["chats"] })]),
  });
};

/** Gera de novo o bot da bio a partir das perguntas. Sem `force`, o servidor recusa (409) se o fluxo foi editado à mão. */
export const useRegenerateBioBot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pageId, faqs, force }: { pageId: string; faqs: Pick<BioFaq, "question" | "answer" | "id">[]; force?: boolean }) => {
      const { data } = await api.post<{ page: LandingPageRecord; aiUsed: boolean }>(`/bio/${pageId}/bot`, { faqs, force });
      return data;
    },
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: ["bio"] }), queryClient.invalidateQueries({ queryKey: ["landing-pages"] }), queryClient.invalidateQueries({ queryKey: ["flow"] })]),
  });
};
