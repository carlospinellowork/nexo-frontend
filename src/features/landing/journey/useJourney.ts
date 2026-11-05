import { useCallback, useEffect, useRef, useState } from "react";
import type { OutboundMessage } from "../../../api/mutations/useSimulator";

export interface JourneyEntry {
  id: string;
  from: "bot" | "user";
  message: OutboundMessage;
}

export type JourneyStatus = "loading" | "waiting" | "completed" | "handoff" | "failed";

export interface JourneyTurn {
  sessionId: string;
  messages: OutboundMessage[];
  status: string;
}

/** Como a conversa fala com o motor: rota pública na bio no ar, simulador na prévia do editor. */
export interface JourneyTransport {
  start: () => Promise<JourneyTurn>;
  send: (sessionId: string, content: string, optionId?: string) => Promise<JourneyTurn>;
  /** Conversa guardada neste aparelho: o celular pode recarregar a página ao voltar do WhatsApp. */
  resume?: () => Promise<{ sessionId: string; messages: { from: "bot" | "user"; message: OutboundMessage }[]; status: string } | null>;
  forget?: () => void;
  whatsapp?: (sessionId: string) => void;
}

export interface Journey {
  entries: JourneyEntry[];
  status: JourneyStatus;
  busy: boolean;
  error: string | null;
  send: (content: string, optionId?: string) => Promise<boolean>;
  ask: (question: string) => Promise<void>;
  restart: () => Promise<void>;
  tapWhatsapp: () => void;
}

const statusOf = (engine: string): JourneyStatus => {
  if (engine === "COMPLETED" || engine === "ERROR") return "completed";
  if (engine === "HANDOFF") return "handoff";
  return "waiting";
};

let nextId = 0;
const entry = (from: JourneyEntry["from"], message: OutboundMessage): JourneyEntry => ({ id: `j${nextId++}`, from, message });

/** Estado da conversa da jornada. Se não conseguir abrir, fica em "failed" e a bio mostra os links. */
export function useJourney(transport: JourneyTransport | null): Journey {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [status, setStatus] = useState<JourneyStatus>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef<string | null>(null);

  const begin = useCallback(async (t: JourneyTransport) => {
    setStatus("loading");
    setEntries([]);
    setError(null);
    try {
      const turn = await t.start();
      sessionId.current = turn.sessionId;
      setEntries(turn.messages.map((m) => entry("bot", m)));
      setStatus(statusOf(turn.status));
      return true;
    } catch {
      setStatus("failed");
      return false;
    }
  }, []);

  useEffect(() => {
    if (!transport) return;
    let cancelled = false;
    void (async () => {
      const saved = await transport.resume?.().catch(() => null);
      if (cancelled) return;
      if (saved) {
        sessionId.current = saved.sessionId;
        setEntries(saved.messages.map((m) => entry(m.from, m.message)));
        setStatus(statusOf(saved.status));
        return;
      }
      await begin(transport);
    })();
    return () => {
      cancelled = true;
    };
  }, [transport, begin]);

  const send = useCallback(
    async (content: string, optionId?: string) => {
      if (!transport || !sessionId.current) return false;
      const mine = entry("user", { type: "text", text: content });
      setEntries((all) => [...all, mine]);
      setBusy(true);
      setError(null);
      try {
        const turn = await transport.send(sessionId.current, content, optionId);
        setEntries((all) => [...all, ...turn.messages.map((m) => entry("bot", m))]);
        setStatus(statusOf(turn.status));
        return true;
      } catch {
        setEntries((all) => all.filter((e) => e.id !== mine.id));
        setError("Não consegui enviar. Tente de novo.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [transport],
  );

  const restart = useCallback(async () => {
    if (!transport) return;
    transport.forget?.();
    sessionId.current = null;
    await begin(transport);
  }, [transport, begin]);

  const ask = useCallback(
    async (question: string) => {
      if (!transport) return;
      // Conversa encerrada não responde mais: a pergunta abre uma nova.
      if (status === "completed" || status === "handoff" || !sessionId.current) {
        transport.forget?.();
        sessionId.current = null;
        if (!(await begin(transport))) return;
      }
      await send(question);
    },
    [transport, status, begin, send],
  );

  const tapWhatsapp = useCallback(() => {
    if (sessionId.current) transport?.whatsapp?.(sessionId.current);
  }, [transport]);

  return { entries, status, busy, error, send, ask, restart, tapWhatsapp };
}
