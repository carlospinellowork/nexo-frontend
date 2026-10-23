import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Play, Plus, Variable } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import type { SimulatorResult } from "../../api/mutations/useSimulator";
import { useGetFlow } from "../../api/queries/useGetFlow";
import { withDefaults } from "../../features/chatBuilder/store/chat-builder-store";
import { ExecutionPath } from "../../features/flow/components/ExecutionPath";
import { SimulationChat } from "../../features/flow/components/SimulationChat";
import { useSimulatorSession } from "../../features/flow/hooks/useSimulatorSession";
import { useFlowStore } from "../../features/flow/store/flow.store";
import { Header } from "../../shared/components/layout/Header";
import { Button } from "../../shared/components/ui/Button";
import { ChatSelect } from "../../shared/components/ui/ChatSelect";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { useActiveChat } from "../../shared/hooks/useActiveChat";

export const Route = createFileRoute("/_app/simulate")({
  component: SimulatorPage,
});

function SimulatorPage() {
  const navigate = useNavigate();
  const { chats, chat, chatId, setChatId } = useActiveChat();
  const { data: flow } = useGetFlow(chatId);
  const setHighlighted = useFlowStore((s) => s.setHighlighted);

  const onResult = useCallback((r: SimulatorResult) => setHighlighted(r.visited), [setHighlighted]);
  const { lines, path, last, busy, canSend, restart, send } = useSimulatorSession(chatId, onResult);
  const startedFor = useRef<string | null>(null);

  // Começa uma conversa nova ao abrir a tela ou trocar de chat.
  useEffect(() => {
    if (chatId && startedFor.current !== chatId) {
      startedFor.current = chatId;
      void restart();
    }
  }, [chatId, restart]);

  if (chats?.length === 0) {
    return (
      <EmptyState icon={Play} title="Nada para testar ainda" description="Crie um assistente e teste a conversa dele aqui, como se fosse um cliente.">
        <Button icon={Plus} onClick={() => navigate({ to: "/chat-builder" })}>
          Criar assistente
        </Button>
      </EmptyState>
    );
  }

  const variables = Object.entries(last?.variables ?? {}).filter(([k]) => k !== "channel");

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Simulador"
        subtitle="Teste o rascunho salvo, exatamente como o cliente vai ver"
        actions={
          <>
            <ChatSelect label="Chat" chats={chats} value={chatId} onChange={setChatId} />
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate({ to: "/flow-builder" })}>
              Voltar ao editor
            </Button>
          </>
        }
      />

      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        <div className="hidden w-72 shrink-0 lg:block">
          <ExecutionPath nodes={flow?.nodes ?? []} path={path} currentNodeId={last?.currentNode ?? null} waiting={last?.status === "WAITING"} />
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <SimulationChat
            lines={lines}
            settings={withDefaults(chat?.settings)}
            canSend={canSend}
            busy={busy}
            onSend={send}
            onRestart={restart}
          />
        </div>

        <div className="hidden w-72 shrink-0 flex-col rounded-3xl bg-panel p-5 shadow-card xl:flex">
          <h3 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-text-primary">
            <Variable size={18} className="text-accent" />
            Variáveis da conversa
          </h3>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {variables.length === 0 && <p className="text-[14px] text-text-secondary">As respostas do cliente aparecem aqui.</p>}
            {variables.map(([key, value]) => (
              <motion.div key={key} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-panel-2 px-3.5 py-2.5">
                <div className="font-mono text-[12px] font-semibold text-accent-strong">{`{{${key}}}`}</div>
                <div className="break-all text-[14px] text-text-primary">{value || <span className="text-text-secondary">(vazio)</span>}</div>
              </motion.div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-snug text-text-secondary">O simulador usa o mesmo motor do WhatsApp, Instagram, Telegram e do site.</p>
        </div>
      </div>
    </div>
  );
}
