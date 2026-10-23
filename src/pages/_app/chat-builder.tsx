import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MessageSquarePlus, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { usePatchChatSettings } from "../../api/mutations/usePatchChatSettings";
import { usePostChat } from "../../api/mutations/usePostChat";
import { EmbedCode } from "../../features/chatBuilder/components/EmbedCode";
import { SettingsPanel } from "../../features/chatBuilder/components/SettingsPanel";
import { WidgetPreview } from "../../features/chatBuilder/components/WidgetPreview";
import { useChatBuilderStore } from "../../features/chatBuilder/store/chat-builder-store";
import { Header } from "../../shared/components/layout/Header";
import { Badge } from "../../shared/components/ui/Badge";
import { Button } from "../../shared/components/ui/Button";
import { ChatSelect } from "../../shared/components/ui/ChatSelect";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { PromptDialog } from "../../shared/components/ui/PromptDialog";
import { toast } from "../../shared/components/ui/toast-store";
import { useActiveChat } from "../../shared/hooks/useActiveChat";

export const Route = createFileRoute("/_app/chat-builder")({
  component: ChatBuilderPage,
});

function ChatBuilderPage() {
  const { chats, chat, chatId, setChatId, isLoading } = useActiveChat();
  const { mutateAsync: createChat, isPending: isCreating } = usePostChat();
  const { mutateAsync: saveChat, isPending: isSaving } = usePatchChatSettings();
  const { activeChatId, name, draft, dirty, load, markSaved } = useChatBuilderStore();
  const [creating, setCreating] = useState(false);

  // Carrega o rascunho a partir do servidor quando o chat muda (ou acaba de ser salvo).
  useEffect(() => {
    if (chat && (chat.id !== activeChatId || !dirty)) load(chat);
  }, [chat, activeChatId, dirty, load]);

  const handleCreate = async (chatName: string) => {
    try {
      const created = await createChat(chatName);
      setChatId(created.id);
      setCreating(false);
      toast.success(`Chat "${created.name}" criado com um fluxo de exemplo.`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleSave = async () => {
    if (!chatId) return;
    try {
      await saveChat({ id: chatId, name: name.trim() || undefined, settings: draft });
      markSaved();
      toast.success("Aparência salva.");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const dialog = (
    <PromptDialog
      open={creating}
      title="Novo assistente"
      label="Nome do assistente"
      placeholder="Ex.: Atendimento do site"
      loading={isCreating}
      onConfirm={handleCreate}
      onClose={() => setCreating(false)}
    />
  );

  if (!isLoading && chats?.length === 0) {
    return (
      <>
        <EmptyState icon={MessageSquarePlus} title="Crie seu primeiro assistente" description="Ele já vem com uma conversa de exemplo funcionando. Depois é só personalizar.">
          <Button icon={Plus} size="lg" onClick={() => setCreating(true)}>
            Criar assistente
          </Button>
        </EmptyState>
        {dialog}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Aparência"
        subtitle="Como o assistente aparece no seu site"
        badge={dirty ? <Badge tone="warning">Não salvo</Badge> : <Badge tone="success" icon={CheckCircle2}>Salvo</Badge>}
        actions={
          <div className="flex items-center gap-3">
            <ChatSelect label="Chat" chats={chats} value={chatId} onChange={setChatId} />
            <Button variant="outline" icon={Save} onClick={handleSave} disabled={!dirty} loading={isSaving}>
              Salvar
            </Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              Novo assistente
            </Button>
          </div>
        }
      />
      {isLoading || !chat ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <SettingsPanel />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <WidgetPreview />
            <EmbedCode chatId={chat.id} />
          </div>
        </div>
      )}
      {dialog}
    </div>
  );
}
