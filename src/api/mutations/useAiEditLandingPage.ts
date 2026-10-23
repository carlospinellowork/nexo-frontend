import { useMutation } from "@tanstack/react-query";
import type { LandingSection } from "../../features/landing/contract";
import { api } from "../instance";

/** Pede à IA uma mudança na página. Devolve as seções alteradas sem salvar. */
export const useAiEditLandingPage = () =>
  useMutation({
    mutationFn: async ({ id, instruction, sections }: { id: string; instruction: string; sections: LandingSection[] }) => {
      const { data } = await api.post<{ sections: LandingSection[] }>(`/landing-pages/${id}/ai`, { instruction, sections });
      return data.sections;
    },
  });
