import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, ChartLine, CheckCircle2, Circle, LayoutTemplate, type LucideIcon, Users } from "lucide-react";
import { motion } from "motion/react";
import { useGetChats } from "../../api/queries/useGetChats";
import { useGetIntegrations } from "../../api/queries/useGetIntegrations";
import { authClient } from "../../lib/auth-client";
import { Badge } from "../../shared/components/ui/Badge";
import { useActiveChat } from "../../shared/hooks/useActiveChat";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

interface Pillar {
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
  to?: string;
  status: string;
  soon?: boolean;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } } };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function HomePage() {
  const { data: session } = authClient.useSession();
  const { data: chats } = useGetChats();
  const { chatId } = useActiveChat();
  const { data: integrations } = useGetIntegrations(chatId);

  const chatCount = chats?.length ?? 0;
  const channelCount = integrations?.length ?? 0;
  const firstName = session?.user.name?.split(" ")[0];
  const date = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const today = date.charAt(0).toUpperCase() + date.slice(1);

  const pillars: Pillar[] = [
    {
      title: "Conversas",
      description: "Bots no WhatsApp, Instagram, Telegram e no seu site",
      icon: Bot,
      tint: "bg-primary/12 text-primary",
      to: "/flow-builder",
      status: chatCount ? `${chatCount} ${chatCount === 1 ? "bot criado" : "bots criados"}` : "Criar primeiro bot",
    },
    { title: "Páginas", description: "Landing pages criadas conversando com a IA", icon: LayoutTemplate, tint: "bg-accent/14 text-accent", status: "Em breve", soon: true },
    { title: "Contatos", description: "Todo lead dos bots e páginas num só lugar", icon: Users, tint: "bg-success/14 text-success-strong", status: "Em breve", soon: true },
    { title: "Resultados", description: "Conversas, leads e onde as pessoas desistem", icon: ChartLine, tint: "bg-warning/16 text-warning-strong", status: "Em breve", soon: true },
  ];

  const steps = [
    { done: chatCount > 0, title: "Crie seu assistente", description: "Nome e aparência do bot.", to: "/chat-builder" },
    { done: chatCount > 0, title: "Monte a conversa", description: "Mensagens, perguntas e decisões.", to: "/flow-builder" },
    { done: false, title: "Teste como cliente", description: "Converse com o bot antes de publicar.", to: "/simulate" },
    { done: channelCount > 0, title: "Conecte um canal", description: "WhatsApp, Instagram, Telegram ou site.", to: "/integrations" },
  ];

  const next = !chatCount
    ? { title: "Crie seu primeiro assistente e veja ele conversando em um minuto", cta: "Criar assistente", to: "/chat-builder" }
    : !channelCount
      ? { title: "Conecte o WhatsApp ou o Instagram e comece a atender automaticamente", cta: "Conectar canal", to: "/integrations" }
      : { title: "Seu bot está no ar. Teste a conversa como se fosse um cliente", cta: "Abrir simulador", to: "/simulate" };

  return (
    <div className="h-full overflow-y-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-10 py-10">
        <motion.div variants={item} className="flex flex-col gap-1">
          <span className="text-[15px] text-text-secondary">{today}</span>
          <h1 className="text-[34px] font-extrabold tracking-[-0.02em] text-text-primary">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {pillars.map((p) => {
            const content = (
              <>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.tint}`}>
                  <p.icon size={24} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[18px] font-bold text-text-primary">{p.title}</span>
                  <span className="text-[14px] leading-snug text-text-secondary">{p.description}</span>
                </span>
                {p.soon ? <Badge>Em breve</Badge> : <span className="text-[14px] font-semibold text-primary-strong">{p.status}</span>}
              </>
            );
            const className = "flex h-full flex-col items-start gap-4 rounded-3xl bg-panel p-6 shadow-card";
            return p.to ? (
              <motion.div key={p.title} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
                <Link to={p.to} className={`${className} transition-shadow hover:shadow-float`}>
                  {content}
                </Link>
              </motion.div>
            ) : (
              <div key={p.title} className={`${className} opacity-80`}>
                {content}
              </div>
            );
          })}
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-3xl bg-panel p-6 shadow-card">
            <h2 className="mb-4 text-[18px] font-bold text-text-primary">Comece por aqui</h2>
            <ol className="flex flex-col">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <Link to={step.to} className="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-panel-hover">
                    <span className="w-5 text-center text-[13px] font-bold text-text-secondary">{i + 1}</span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-[15px] font-semibold text-text-primary">{step.title}</span>
                      <span className="text-[14px] text-text-secondary">{step.description}</span>
                    </span>
                    {step.done ? <CheckCircle2 size={22} className="text-success" /> : <Circle size={22} className="text-text-secondary/40" />}
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-[#0B1220] p-6 text-white">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7C5CFF] opacity-40 blur-3xl" />
            <span className="relative text-[13px] font-bold uppercase tracking-wider text-[#C4B1FF]">Próximo passo</span>
            <p className="relative text-[20px] font-bold leading-snug">{next.title}</p>
            <Link
              to={next.to}
              className="relative mt-auto flex h-11 items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-semibold text-[#0B1220] transition-transform active:scale-[0.98]"
            >
              {next.cta}
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
