import { useQuery } from "@tanstack/react-query";
import { api } from "../instance";

export interface AdminAccount {
  name: string | null;
  email: string;
  workspace: string;
  createdAt: string;
  lastSeenAt: string | null;
  onboarded: boolean;
  bioPublished: boolean;
  pagesPublished: number;
  bots: number;
  clicks7: number;
  whatsappClicks7: number;
  qrReads7: number;
  conversations7: number;
  leads: number;
}

export interface AdminFeedback {
  id: string;
  rating: number | null;
  message: string;
  page: string;
  createdAt: string;
  user: { name: string | null; email: string };
}

export interface AdminError {
  id: string;
  source: "web" | "api";
  message: string;
  path: string;
  stack: string | null;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

/** Painel de acompanhamento da fase de testes (só admin; os outros recebem 404). */
export const useGetAdminOverview = (enabled: boolean) =>
  useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const { data } = await api.get<{ accounts: AdminAccount[]; feedback: AdminFeedback[]; errors: AdminError[] }>("/admin/overview");
      return data;
    },
    enabled,
    refetchInterval: 60_000,
  });
