import { useQuery } from "@tanstack/react-query";
import { api } from "../instance";

/** Formas de entrar ligadas no servidor (o botão do Google só aparece com as chaves configuradas). */
export interface AuthProviders {
  google: boolean;
}

export const useGetAuthProviders = () =>
  useQuery({
    queryKey: ["auth-providers"],
    queryFn: async () => {
      const { data } = await api.get<AuthProviders>("/auth-providers");
      return data;
    },
    staleTime: 10 * 60_000,
    retry: false,
  });
