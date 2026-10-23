import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LandingPageRecord } from "../../features/landing/contract";
import { api } from "../instance";

/** Publica o rascunho salvo (seções, título, tema e configurações). Exige papel Admin. */
export const usePublishLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<LandingPageRecord>(`/landing-pages/${id}/publish`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["landing-pages"] }),
  });
};
