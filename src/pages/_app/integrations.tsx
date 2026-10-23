import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Info, Loader2, Plus, Send } from "lucide-react";
import { motion } from "motion/react";
import { useGetChannelStatus } from "../../api/queries/useGetChannelStatus";
import { useGetIntegrations } from "../../api/queries/useGetIntegrations";
import { CHANNELS } from "../../features/integrations/channels";
import { ChannelCard } from "../../features/integrations/components/ChannelCard";
import { Header } from "../../shared/components/layout/Header";
import { Button } from "../../shared/components/ui/Button";
import { ChatSelect } from "../../shared/components/ui/ChatSelect";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { useActiveChat } from "../../shared/hooks/useActiveChat";

export const Route = createFileRoute("/_app/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const navigate = useNavigate();
  const { chats, chat, chatId, setChatId, isLoading } = useActiveChat();
  const { data: integrations, isLoading: loadingIntegrations } = useGetIntegrations(chatId);
  const { data: status } = useGetChannelStatus();

  if (!isLoading && chats?.length === 0) {
    return (
      <EmptyState icon={Send} title="Crie um assistente primeiro" description="Depois conecte o WhatsApp, o Instagram ou o Telegram para ele atender por lá.">
        <Button icon={Plus} onClick={() => navigate({ to: "/chat-builder" })}>
          Criar assistente
        </Button>
      </EmptyState>
    );
  }

  const metaWarning = !status
    ? undefined
    : !status.webhooksReady
      ? "Ambiente local: a Meta só entrega mensagens para uma URL pública HTTPS. Rode ngrok http 3000 e defina PUBLIC_API_URL no .env do backend. Você já pode conectar a conta para validar o token."
      : !status.metaConfigured
        ? "O servidor ainda não tem META_APP_SECRET e META_VERIFY_TOKEN configurados, então as mensagens não serão recebidas."
        : undefined;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title="Canais" subtitle="Onde o seu assistente atende" actions={<ChatSelect label="Chat" chats={chats} value={chatId} onChange={setChatId} />} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8">
        <div className="flex gap-3 rounded-3xl bg-primary/10 p-4 text-[14px] leading-snug text-text-primary">
          <Info size={20} className="mt-0.5 shrink-0 text-primary" />
          <p>
            Todos os canais deste assistente seguem a mesma conversa de <b>{chat?.name}</b>. Teste no Simulador antes: o comportamento é idêntico.
          </p>
        </div>

        {status?.webhooksReady && status.metaConfigured && (
          <p className="px-1 text-[13px] text-text-secondary">
            URL de webhook do app Meta: <code className="font-mono text-primary-strong">{status.metaWebhookUrl}</code>
          </p>
        )}

        {loadingIntegrations || !chatId ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : (
          CHANNELS.map((channel, i) => (
            <motion.div key={`${chatId}-${channel.type}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
              <ChannelCard
                channel={channel}
                chatId={chatId}
                integration={integrations?.find((it) => it.type === channel.type)}
                warning={channel.needsMeta ? metaWarning : undefined}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
