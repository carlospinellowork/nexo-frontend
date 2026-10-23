import { FlaskConical, RefreshCw, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import type { SimulatorResult } from "../../../api/mutations/useSimulator";
import type { ChatSettings } from "../../chatBuilder/store/chat-builder-store";
import { useSimulatorSession } from "../hooks/useSimulatorSession";
import { useFlowStore } from "../store/flow.store";
import { SimulationChat } from "./SimulationChat";

interface TestPanelProps {
  chatId: string;
  settings: ChatSettings;
  /** Salva o rascunho se houver alterações; false se não conseguiu. */
  ensureSaved: () => Promise<boolean>;
}

/** Teste ao vivo ao lado do editor: roda o rascunho no motor real e acende os blocos executados. */
export function TestPanel({ chatId, settings, ensureSaved }: TestPanelProps) {
  const setTestOpen = useFlowStore((s) => s.setTestOpen);
  const setHighlighted = useFlowStore((s) => s.setHighlighted);
  const dirty = useFlowStore((s) => s.dirty);

  const onResult = useCallback((r: SimulatorResult) => setHighlighted(r.visited), [setHighlighted]);
  const session = useSimulatorSession(chatId, onResult);
  const { restart } = session;

  const run = useCallback(async () => {
    if (await ensureSaved()) await restart();
  }, [ensureSaved, restart]);

  // Começa ao abrir o painel (uma vez por chat; o StrictMode roda o effect duas vezes).
  const startedFor = useRef<string | null>(null);
  useEffect(() => {
    if (startedFor.current === chatId) return;
    startedFor.current = chatId;
    void run();
  }, [chatId, run]);

  useEffect(() => () => setHighlighted([]), [setHighlighted]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 34 }}
      className="absolute bottom-4 right-4 top-4 z-50 flex w-[360px] flex-col gap-3 rounded-3xl border border-border-ui bg-panel p-3 shadow-float"
    >
      <div className="flex items-center gap-2 px-2 pt-1">
        <FlaskConical size={17} className="text-accent" />
        <h3 className="flex-1 text-[15px] font-bold tracking-tight text-text-primary">Teste ao vivo</h3>
        <button onClick={() => setTestOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-panel-hover" aria-label="Fechar teste">
          <X size={18} />
        </button>
      </div>

      {dirty && (
        <button
          onClick={() => void run()}
          className="flex items-center gap-2 rounded-2xl bg-warning/14 px-3 py-2 text-left text-[13px] font-medium text-warning-strong hover:bg-warning/20"
        >
          <RefreshCw size={15} className="shrink-0" />
          Você mudou o fluxo. Clique para salvar e testar de novo.
        </button>
      )}

      <div className="min-h-0 flex-1">
        <SimulationChat compact lines={session.lines} settings={settings} canSend={session.canSend} busy={session.busy} onSend={session.send} onRestart={() => void run()} />
      </div>
      <p className="px-2 pb-1 text-[12px] leading-snug text-text-secondary">Usa o rascunho salvo. Os clientes só veem o fluxo depois de publicar.</p>
    </motion.aside>
  );
}
