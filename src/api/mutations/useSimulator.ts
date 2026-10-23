import { useMutation } from "@tanstack/react-query";
import { api } from "../instance";

/** Mensagem enviada pelo motor (mesmo formato de nexo-backend/src/domain/flow/engine.ts). */
export type OutboundMessage =
  | { type: "text"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "buttons"; text: string; options: { id: string; label: string }[] };

export type SessionStatus = "WAITING" | "COMPLETED" | "ERROR" | "HANDOFF";

export interface SimulatorResult {
  sessionId: string;
  messages: OutboundMessage[];
  status: SessionStatus;
  currentNode: string | null;
  visited: string[];
  variables: Record<string, string>;
  error?: string;
}

/** Inicia uma conversa de teste no motor real do backend (usa o rascunho salvo). */
export const useStartSimulation = () =>
  useMutation({
    mutationFn: async (chatId: string) => {
      const { data } = await api.post<SimulatorResult>(`/chats/${chatId}/simulator/sessions`);
      return data;
    },
  });

export const useSendSimulationMessage = () =>
  useMutation({
    mutationFn: async ({ chatId, sessionId, content, optionId }: { chatId: string; sessionId: string; content: string; optionId?: string }) => {
      const { data } = await api.post<SimulatorResult>(`/chats/${chatId}/simulator/sessions/${sessionId}/messages`, { content, optionId });
      return data;
    },
  });
