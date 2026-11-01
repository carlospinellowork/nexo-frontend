import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Code2, Globe, Info, Link2, Loader2, type IconComponent, MessageCircle, Plus, QrCode, Wrench } from "../../shared/icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGetChannelStatus } from "../../api/queries/useGetChannelStatus";
import { useGetIntegrations } from "../../api/queries/useGetIntegrations";
import { CHANNELS } from "../../features/integrations/channels";
import { ChannelCard } from "../../features/integrations/components/ChannelCard";
import { Header } from "../../shared/components/layout/Header";
import { Button } from "../../shared/components/ui/Button";
import { ChatSelect } from "../../shared/components/ui/ChatSelect";
import { gestureFor } from "../../shared/components/ui/gestures";
import { useActiveChat } from "../../shared/hooks/useActiveChat";

export const Route = createFileRoute("/_app/integrations")({
  component: IntegrationsPage,
});

interface Ready {
  to: string;
  title: string;
  text: string;
  icon: IconComponent;
}

// Nível 1 (docs/ESTRATEGIA-CANAIS.md): funciona na hora, sem conta de API nem custo por mensagem.
const READY: Ready[] = [
  { to: "/minha-bio", title: "Link na bio", text: "Cole no Instagram e no TikTok. O assistente atende quem chega.", icon: Link2 },
  { to: "/qr-codes", title: "QR Codes", text: "No balcão, na vitrine e na embalagem, com a contagem de leituras.", icon: QrCode },
  { to: "/flow-builder", title: "Botão do WhatsApp", text: "O bloco \"Continuar no WhatsApp\" leva a pessoa ao seu número com a mensagem pronta.", icon: MessageCircle },
  { to: "/landing-pages", title: "Páginas", text: "Uma página completa da empresa, com o assistente instalado.", icon: Globe },
  { to: "/chat-builder", title: "No seu site", text: "Copie uma linha de código e o assistente aparece no seu site.", icon: Code2 },
];

function IntegrationsPage() {
  const navigate = useNavigate();
  const { chats, chat, chatId, setChatId, isLoading } = useActiveChat();
  const { data: integrations, isLoading: loadingIntegrations } = useGetIntegrations(chatId);
  const { data: status } = useGetChannelStatus();
  const connected = (integrations?.length ?? 0) > 0;
  const [advancedOpen, setAdvancedOpen] = useState<boolean | null>(null);
  // Aberto por padrão só para quem já tem um canal oficial conectado.
  const open = advancedOpen ?? connected;
  const noChats = !isLoading && chats?.length === 0;

  const metaWarning = !status
    ? undefined
    : !status.webhooksReady
      ? "Este servidor ainda não tem um endereço público https, então a Meta não consegue entregar as mensagens. Você já pode conectar a conta para validar o token."
      : !status.metaConfigured
        ? "O servidor ainda não tem o app da Meta configurado (META_APP_SECRET e META_VERIFY_TOKEN), então as mensagens não serão recebidas."
        : undefined;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header
        title="Canais"
        subtitle="Onde as pessoas encontram você e o seu assistente"
        actions={!noChats && open ? <ChatSelect label="Chat" chats={chats} value={chatId} onChange={setChatId} /> : undefined}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-3 py-4 md:px-6 md:py-6">
        <section className="flex flex-col gap-2.5">
          <div className="px-1">
            <h2 className="text-[16px] font-bold text-text-primary">Já funcionam, sem configurar nada</h2>
            <p className="text-[13px] text-text-secondary">Sem conta de API e sem custo por mensagem.</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {READY.map(({ to, title, text, icon: Icon }, i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
                <Link
                  to={to}
                  className="nx-anim group flex h-full items-start gap-3 rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-float"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
                    <Icon size={18} strokeWidth={2.2} data-gesture={gestureFor(Icon)} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-[14.5px] font-semibold text-text-primary">
                      {title}
                      <ArrowRight size={14} className="text-text-secondary transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-[13px] leading-snug text-text-secondary">{text}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border-ui/70 bg-panel shadow-card">
          <button
            type="button"
            onClick={() => setAdvancedOpen(!open)}
            aria-expanded={open}
            className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-colors hover:bg-panel-hover"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-text-secondary/12 text-text-secondary">
              <Wrench size={17} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[14.5px] font-semibold text-text-primary">Avançado: APIs oficiais</span>
              <span className="text-[13px] text-text-secondary">
                {connected ? `${integrations?.length} conectado${integrations && integrations.length > 1 ? "s" : ""}` : "WhatsApp API, Instagram Direct e Telegram, com a sua conta de cada plataforma"}
              </span>
            </span>
            <ChevronDown size={18} className={`shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 border-t border-border-ui px-3 pb-3 pt-3">
                  {noChats ? (
                    <div className="flex flex-col items-start gap-2 p-1">
                      <p className="text-[13.5px] text-text-secondary">Para atender pelas APIs oficiais, crie um assistente primeiro.</p>
                      <Button icon={Plus} size="sm" onClick={() => navigate({ to: "/chat-builder" })}>
                        Criar assistente
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2.5 rounded-xl bg-primary/8 p-3 text-[13px] leading-snug text-text-primary">
                        <Info size={17} className="mt-0.5 shrink-0 text-primary" />
                        <p>
                          Todos os canais deste assistente seguem a mesma conversa de <b>{chat?.name}</b>. O custo de cada mensagem é cobrado pela
                          plataforma, na sua conta.
                        </p>
                      </div>
                      {status?.webhooksReady && status.metaConfigured && (
                        <p className="px-1 text-[12.5px] text-text-secondary">
                          URL de webhook do app Meta: <code className="font-mono text-primary-strong">{status.metaWebhookUrl}</code>
                        </p>
                      )}
                      {loadingIntegrations || !chatId ? (
                        <div className="flex justify-center py-8">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      ) : (
                        CHANNELS.map((channel) => (
                          <ChannelCard
                            key={`${chatId}-${channel.type}`}
                            channel={channel}
                            chatId={chatId}
                            integration={integrations?.find((it) => it.type === channel.type)}
                            warning={channel.needsMeta ? metaWarning : undefined}
                          />
                        ))
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
