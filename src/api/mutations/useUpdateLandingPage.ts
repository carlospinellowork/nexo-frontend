import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LandingPageRecord, LandingPageSettings, LandingSection, LandingTheme } from "../../features/landing/contract";
import { api } from "../instance";

export interface UpdateLandingPagePayload {
  title?: string;
  slug?: string;
  description?: string;
  theme?: LandingTheme;
  chatId?: string | null;
  sections?: LandingSection[];
  settings?: LandingPageSettings;
}

export const useUpdateLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateLandingPagePayload & { id: string }) => {
      const { data } = await api.patch<LandingPageRecord>(`/landing-pages/${id}`, payload);
      return data;
    },
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: ["landing-pages"] }), queryClient.invalidateQueries({ queryKey: ["bio"] })]),
  });
};
