import { useCallback, useState } from "react";
import { apiErrorMessage } from "../../../api/instance";
import { type OutboundMessage, type SimulatorResult, useSendSimulationMessage, useStartSimulation } from "../../../api/mutations/useSimulator";

export type ChatLine =
  | { id: string; from: "bot" | "user"; message: OutboundMessage }
  | { id: string; from: "system"; text: string; tone?: "info" | "warning" | "danger" };

const lineId = () => crypto.randomUUID();

const STATUS_LINES: Partial<Record<SimulatorResult["status"], (r: SimulatorResult) => ChatLine>> = {
  COMPLETED: () => ({ id: lineId(), from: "system", text: "Conversa encerrada" }),
  HANDOFF: () => ({ id: lineId(), from: "system", text: "Transferida para um atendente", tone: "warning" }),
  ERROR: (r) => ({ id: lineId(), from: "system", text: `Erro no fluxo: ${r.error ?? ""}`, tone: "danger" }),
};

/**
 * Conversa de teste no motor real do backend. Usada pela página do simulador e pelo painel
 * de teste do editor. `onResult` recebe cada resposta (ex.: para destacar os blocos executados).
 */
export function useSimulatorSession(chatId: string | null, onResult?: (result: SimulatorResult) => void) {
  const { mutateAsync: startSimulation } = useStartSimulation();
  const { mutateAsync: sendMessage } = useSendSimulationMessage();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [last, setLast] = useState<SimulatorResult | null>(null);
  // Estado local (e não mutation.isPending): a conversa costuma ser iniciada num effect, e o
  // StrictMode desinscreve o observer da mutation nesse ciclo, deixando isPending preso em true.
  const [busy, setBusy] = useState(false);

  const apply = useCallback(
    (result: SimulatorResult) => {
      setLast(result);
      setPath((p) => [...p, ...result.visited]);
      onResult?.(result);
      const status = STATUS_LINES[result.status]?.(result);
      setLines((l) => [...l, ...result.messages.map((message) => ({ id: lineId(), from: "bot" as const, message })), ...(status ? [status] : [])]);
    },
    [onResult],
  );

  const fail = useCallback(
    (err: unknown) => setLines((l) => [...l, { id: lineId(), from: "system", text: apiErrorMessage(err), tone: "danger" }]),
    [],
  );

  const restart = useCallback(async () => {
    if (!chatId) return;
    setLines([{ id: lineId(), from: "system", text: "Conversa iniciada" }]);
    setPath([]);
    setLast(null);
    setSessionId(null);
    setBusy(true);
    try {
      const result = await startSimulation(chatId);
      setSessionId(result.sessionId);
      apply(result);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }, [chatId, startSimulation, apply, fail]);

  const send = async (text: string, optionId?: string) => {
    if (!chatId || !sessionId) return;
    setLines((l) => [...l, { id: lineId(), from: "user", message: { type: "text", text } }]);
    setBusy(true);
    try {
      apply(await sendMessage({ chatId, sessionId, content: text, optionId }));
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return { lines, path, last, busy, canSend: last?.status === "WAITING", restart, send };
}
