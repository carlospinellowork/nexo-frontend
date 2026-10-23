import { useQuery } from "@tanstack/react-query";
import type { PublicLandingPage } from "../../features/landing/contract";
import { API_ORIGIN } from "../instance";

/**
 * Página publicada (rota pública). Usa fetch sem cookie nem cabeçalho de workspace: as rotas
 * públicas respondem a qualquer origem, mas não aceitam requisições com credenciais.
 */
export const useGetPublicLandingPage = (slug: string) =>
  useQuery({
    queryKey: ["public-landing-page", slug],
    queryFn: async () => {
      const res = await fetch(`${API_ORIGIN}/api/public/landing-pages/${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as PublicLandingPage;
    },
    retry: false,
  });
