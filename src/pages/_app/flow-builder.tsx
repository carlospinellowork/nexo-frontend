import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, FlaskConical, GitGraph, Loader2, Plus, Redo2, Rocket, Save, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { apiErrorMessage } from "../../api/instance";
import { usePublishFlow } from "../../api/mutations/usePublishFlow";
import { usePutFlow } from "../../api/mutations/usePutFlow";
import { useGetFlow } from "../../api/queries/useGetFlow";
import { withDefaults } from "../../features/chatBuilder/store/chat-builder-store";
import { TestPanel } from "../../features/flow/components/TestPanel";
import { FlowCanvas } from "../../features/flow/FlowCanvas";
import { useFlowStore } from "../../features/flow/store/flow.store";
import { Header } from "../../shared/components/layout/Header";
import { Badge } from "../../shared/components/ui/Badge";
import { Button, IconButton } from "../../shared/components/ui/Button";
import { ChatSelect } from "../../shared/components/ui/ChatSelect";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { toast } from "../../shared/components/ui/toast-store";
import { useActiveChat } from "../../shared/hooks/useActiveChat";
import { HelpButton } from "../../features/tour/HelpButton";
import { startTour } from "../../features/tour/driver-service";

export const Route = createFileRoute("/_app/flow-builder")({
  component: FlowBuilderPage,
});

function FlowBuilderPage() {
  const navigate = useNavigate();
  const { chats, chat, chatId, setChatId, isLoading: loadingChats } = useActiveChat();
  const { dirty, load, markSaved, setHighlighted, testOpen, setTestOpen, undo, redo } = useFlowStore();
  const canUndo = useFlowStore((s) => s.past.length > 0);
  const canRedo = useFlowStore((s) => s.future.length > 0);
  const { data: remoteFlow, isLoading: loadingFlow } = useGetFlow(chatId);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour("flows");
    }, 700);
    return () => clearTimeout(timer);
  }, []);
  const { mutateAsync: saveFlow, isPending: isSaving } = usePutFlow();
  const { mutateAsync: publishFlow, isPending: isPublishing } = usePublishFlow();

  // Carrega a versão do servidor ao abrir/trocar de chat. Depois disso a tela é a fonte do
  // rascunho: o refetch que segue um "Salvar" não apaga o histórico de desfazer.
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (remoteFlow && remoteFlow.chatId === chatId && loadedFor.current !== chatId) {
      loadedFor.current = chatId;
      load(remoteFlow.nodes ?? [], remoteFlow.edges ?? []);
      setHighlighted([]);
    }
  }, [remoteFlow, chatId, load, setHighlighted]);

  // O painel de teste fecha ao trocar de chat ou sair da página.
  useEffect(() => () => setTestOpen(false), [chatId, setTestOpen]);

  // Avisa antes de fechar a aba com alterações não salvas.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /** Salva o rascunho (se houver alterações). Lê o estado na hora, para não salvar uma versão velha. */
  const ensureSaved = useCallback(
    async (notify = false) => {
      const { nodes, edges, dirty: pending } = useFlowStore.getState();
      if (!chatId) return false;
      if (!pending) return true;
      try {
        await saveFlow({ chatId, nodes, edges });
        markSaved();
        if (notify) toast.success("Rascunho salvo. Publique quando quiser que os clientes vejam.");
        return true;
      } catch (err) {
        toast.error(apiErrorMessage(err, "Não foi possível salvar o fluxo."));
        return false;
      }
    },
    [chatId, saveFlow, markSaved],
  );
  const ensureSavedQuietly = useCallback(() => ensureSaved(false), [ensureSaved]);

  const publish = async () => {
    if (!chatId || !(await ensureSaved())) return;
    try {
      await publishFlow(chatId);
      toast.success("Publicado! O fluxo já vale no site e em todos os canais.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível publicar o fluxo."));
    }
  };

  const changeChat = (id: string) => {
    if (dirty && !window.confirm("Há alterações não salvas neste fluxo. Descartar e trocar de chat?")) return;
    setChatId(id);
  };

  if (!loadingChats && chats?.length === 0) {
    return (
      <EmptyState icon={GitGraph} title="Nenhum assistente ainda" description="Crie um assistente para montar a conversa dele aqui.">
        <Button icon={Plus} onClick={() => navigate({ to: "/chat-builder" })}>
          Criar assistente
        </Button>
      </EmptyState>
    );
  }

  const status = dirty ? (
    <Badge tone="warning">Não salvo</Badge>
  ) : remoteFlow?.hasUnpublishedChanges ? (
    <Badge tone="accent">Rascunho não publicado</Badge>
  ) : (
    <Badge tone="success" icon={CheckCircle2}>
      Publicado
    </Badge>
  );

  return (
    <div className="flex h-full flex-col">
      <Header
        title={chat?.name ?? "Fluxos"}
        subtitle="Monte a conversa do seu assistente"
        badge={status}
        actions={
          <div id="tour-flow-actions" className="flex items-center gap-2">
            <ChatSelect label="Chat" chats={chats} value={chatId} onChange={changeChat} />
            <div className="ml-1 flex items-center">
              <IconButton icon={Undo2} label="Desfazer (Ctrl+Z)" title="Desfazer (Ctrl+Z)" onClick={undo} disabled={!canUndo} className="disabled:opacity-35" />
              <IconButton icon={Redo2} label="Refazer (Ctrl+Shift+Z)" title="Refazer (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo} className="disabled:opacity-35" />
            </div>
            <Button variant="outline" icon={Save} onClick={() => void ensureSaved(true)} loading={isSaving && !isPublishing} disabled={!chatId || !dirty}>
              Salvar
            </Button>
            <span id="tour-flow-test">
              <Button variant={testOpen ? "secondary" : "outline"} icon={FlaskConical} onClick={() => setTestOpen(!testOpen)} disabled={!chatId}>
                Testar
              </Button>
            </span>
            <Button icon={Rocket} onClick={() => void publish()} loading={isPublishing} disabled={!chatId || (!dirty && !remoteFlow?.hasUnpublishedChanges)}>
              Publicar
            </Button>
            <HelpButton tourKey="flows" screenTitle="Fluxos" />
          </div>
        }
      />
      <div id="tour-flow-canvas" className="relative flex-1 overflow-hidden">
        {(loadingFlow || loadingChats) && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-bg-start/60 backdrop-blur-sm">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}
        <FlowCanvas chatId={chatId}>{testOpen && chatId && <TestPanel key={chatId} chatId={chatId} settings={withDefaults(chat?.settings)} ensureSaved={ensureSavedQuietly} />}</FlowCanvas>
      </div>
    </div>
  );
}
