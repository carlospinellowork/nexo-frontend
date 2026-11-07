import { visitOrigin } from "../origin";
import { api, API_ORIGIN } from "../../../api/instance";
import type { SimulatorResult } from "../../../api/mutations/useSimulator";
import type { JourneyTransport, JourneyTurn } from "./useJourney";

/** Rotas públicas: fetch sem cookie nem cabeçalho de workspace, como o resto da página publicada. */
async function publicCall<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_ORIGIN}/api${path}`, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

function remembered(key: string, value?: string | null) {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* navegação privada: a conversa só não sobrevive a recarregar */
  }
  return null;
}

function publicTransport(key: string, start: () => Promise<JourneyTurn>): JourneyTransport {
  return {
    start: async () => {
      const turn = await start();
      remembered(key, turn.sessionId);
      return turn;
    },
    send: (sessionId, content, optionId) =>
      publicCall<JourneyTurn>(`/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ...(optionId ? { optionId } : {}) }),
      }),
    resume: async () => {
      const sessionId = remembered(key);
      if (!sessionId) return null;
      try {
        const saved = await publicCall<{ id: string; status: string; messages: { from: "bot" | "user"; message: JourneyTurn["messages"][number] }[] }>(`/sessions/${sessionId}`);
        return { sessionId: saved.id, status: saved.status, messages: saved.messages };
      } catch {
        remembered(key, null);
        return null;
      }
    },
    forget: () => remembered(key, null),
    whatsapp: (sessionId) => {
      void fetch(`${API_ORIGIN}/api/sessions/${sessionId}/whatsapp`, { method: "POST", keepalive: true }).catch(() => undefined);
    },
  };
}

/** Bio que abre direto na jornada. */
export const publicJourneyTransport = (slug: string) =>
  publicTransport(`nexo-journey:${slug}`, () =>
    publicCall<JourneyTurn>(`/public/landing-pages/${encodeURIComponent(slug)}/journey`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: visitOrigin(slug) }) }),
  );

/** Bio que abre nos links: a conversa começa quando a pessoa toca em falar com o assistente, na própria página. */
export const publicChatTransport = (slug: string, chatId: string) => publicTransport(`nexo-chat:${slug}`, () => publicCall<JourneyTurn>("/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId, origin: visitOrigin(slug) }) }));

/** Prévia do editor: o motor real com o rascunho do fluxo, sem contar nos Resultados. */
export function previewJourneyTransport(chatId: string): JourneyTransport {
  return {
    start: async () => (await api.post<SimulatorResult>(`/chats/${chatId}/simulator/sessions`)).data,
    send: async (sessionId, content, optionId) => (await api.post<SimulatorResult>(`/chats/${chatId}/simulator/sessions/${sessionId}/messages`, { content, optionId })).data,
  };
}
