import axios, { isAxiosError } from "axios";
import { useWorkspaceStore } from "../features/workspaces/store/workspace-store";

export const API_ORIGIN = import.meta.env.VITE_API_URL
  ? new URL(import.meta.env.VITE_API_URL).origin
  : "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Todo request do painel informa o workspace ativo; o backend confere se o usuário é membro.
api.interceptors.request.use((config) => {
  const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
  if (workspaceId) config.headers.set("X-Workspace-Id", workspaceId);
  return config;
});

interface ApiErrorBody {
  message?: string;
  details?: { issues?: { message: string }[] };
  issues?: { message: string }[];
}

/** Mensagem legível (pt-BR) a partir de um erro da API. */
export function apiErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    const issues = body?.details?.issues ?? body?.issues;
    if (issues?.length) return [body?.message, ...issues.map((i) => i.message)].filter(Boolean).join("\n");
    if (body?.message) return body.message;
    if (!error.response) return "Não foi possível conectar ao servidor. O backend está rodando?";
  }
  return fallback;
}
