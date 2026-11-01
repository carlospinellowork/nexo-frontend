import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Circle, MessageCircle, MousePointerClick, QrCode, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useGetBio } from "../../api/queries/useGetBio";
import { useGetChats } from "../../api/queries/useGetChats";
import { useGetHandoffs } from "../../api/queries/useGetHandoffs";
import { useGetIntegrations } from "../../api/queries/useGetIntegrations";
import { useGetLandingClicks } from "../../api/queries/useGetLandingClicks";
import { useGetMe } from "../../api/queries/useGetMe";
import { useGetQrCodes } from "../../api/queries/useGetQrCodes";
import { useGetResults } from "../../api/queries/useGetResults";
import { useGetWhatsappResults } from "../../api/queries/useGetWhatsappResults";
import { BioHomeCard } from "../../features/bio/BioHomeCard";
import { ExampleCompanies } from "../../features/examples/ExampleCompanies";
import { HomeHero } from "../../features/home/HomeHero";
import { InstallCard } from "../../features/pwa/InstallApp";
import { QuickActions } from "../../features/home/QuickActions";
import { StatTile } from "../../features/home/StatTile";
import { WhatsappPulse } from "../../features/home/WhatsappPulse";
import { startTour } from "../../features/tour/driver-service";
import { HelpButton } from "../../features/tour/HelpButton";
import { authClient } from "../../lib/auth-client";
import { useActiveChat } from "../../shared/hooks/useActiveChat";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } } };

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

function HomePage() {
  const { data: session } = authClient.useSession();
  const { data: chats } = useGetChats();
  const { chatId } = useActiveChat();
  const { data: integrations } = useGetIntegrations(chatId);
  const { data: results30 } = useGetResults(30);
  const { data: results7 } = useGetResults(7);
  const { data: handoffs } = useGetHandoffs();
  const { data: qrCodes } = useGetQrCodes();
  const { data: bio } = useGetBio();
  const { data: bioClicks } = useGetLandingClicks(bio?.id);
  const { data: me } = useGetMe();
  const { data: whatsapp } = useGetWhatsappResults();

  useEffect(() => {
    const timer = setTimeout(() => startTour("home"), 700);
    return () => clearTimeout(timer);
  }, []);

  // Números reais: últimos 7 dias contra os 7 anteriores.
  // (O endpoint de Resultados aceita 7, 30 ou 90 dias; as duas últimas semanas saem da série de 30.)
  const perDay = results30?.perDay.map((d) => d.count).slice(-14);
  const convWeek = perDay ? sum(perDay.slice(-7)) : undefined;
  const convPrev = perDay && perDay.length >= 14 ? sum(perDay.slice(0, 7)) : undefined;
  const convToday = perDay?.at(-1);
  const leadsWeek = results7?.leads;
  const qrWeek = qrCodes ? sum(qrCodes.map((q) => q.stats?.last7 ?? 0)) : undefined;
  const clicksWeek = bio === null ? 0 : bioClicks ? sum(Object.values(bioClicks.items).map((i) => i.last7)) : undefined;

  const chatCount = chats?.length ?? 0;
  const channelCount = integrations?.length ?? 0;
  const allSteps = [
    { key: "bio", done: Boolean(bio), title: "Crie a sua bio", description: "Links, Pix e o assistente numa página só.", to: "/minha-bio" },
    { key: "bot", done: chatCount > 0, title: "Monte a conversa do bot", description: "Mensagens, perguntas e decisões.", to: "/flow-builder" },
    { key: "qr", done: (qrCodes?.length ?? 0) > 0, title: "Crie um QR Code", description: "Para o balcão, a vitrine ou a embalagem.", to: "/qr-codes" },
    { key: "channel", done: channelCount > 0, title: "Conecte um canal", description: "WhatsApp, Instagram, Telegram ou site.", to: "/integrations" },
  ];
  // O objetivo contado no "conhecer você" decide a ordem dos passos.
  const ORDER: Record<string, string[]> = {
    whatsapp: ["bio", "qr", "bot", "channel"],
    links: ["bio", "qr", "bot", "channel"],
    autoreply: ["bot", "channel", "bio", "qr"],
    sources: ["qr", "bio", "bot", "channel"],
  };
  const order = ORDER[me?.workspace.profile.goal ?? ""] ?? ["bio", "bot", "qr", "channel"];
  const steps = [...allSteps].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  const pending = steps.filter((s) => !s.done).length;
  const next = steps.find((s) => !s.done);

  return (
    <div className="h-full overflow-y-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 md:gap-5 md:px-6 md:py-6">
        <motion.div variants={item}>
          <HomeHero
            firstName={(me?.user.name ?? session?.user.name)?.split(" ")[0]}
            today={convToday}
            week={convWeek}
            waiting={handoffs?.length ?? 0}
            actions={<HelpButton tourKey="home" screenTitle="Início" />}
          >
            <WhatsappPulse data={whatsapp} hasBio={bio !== null && bio !== undefined} />
          </HomeHero>
        </motion.div>

        <InstallCard />

        <motion.div id="tour-home-stats" variants={item} className="grid grid-cols-2 gap-2.5 md:gap-3 xl:grid-cols-4">
          <StatTile label="Conversas" value={convWeek} previous={convPrev} series={perDay} icon={MessageCircle} tone="ocean" to="/results" />
          <StatTile label="Leads novos" value={leadsWeek} icon={Users} tone="green" to="/leads" />
          <StatTile label="Leituras de QR" value={qrWeek} icon={QrCode} tone="lagoon" to="/qr-codes" />
          <StatTile label="Cliques na bio" value={clicksWeek} icon={MousePointerClick} tone="rose" to="/minha-bio" hint={bio === null ? "crie a sua bio" : "nos últimos 7 dias"} />
        </motion.div>

        <motion.div variants={item}>
          <QuickActions />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <BioHomeCard />

          {next ? (
            <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-accent/30 bg-panel p-4 shadow-card">
              <span className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent opacity-25 blur-3xl" />
              <span className="relative flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-accent-strong">
                Próximo passo · faltam {pending}
              </span>
              <p className="relative font-display text-[19px] font-bold leading-snug text-text-primary">{next.title}</p>
              <p className="relative text-[14px] text-text-secondary">{next.description}</p>
              <Link to={next.to} className="nx-btn-gold nx-anim relative mt-auto inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[11px] px-4 text-[14px] font-semibold sm:w-fit">
                Fazer agora
                <ArrowRight size={16} data-gesture="nudge" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col justify-center gap-2 rounded-2xl border border-success/30 bg-success/8 p-4">
              <CheckCircle2 size={22} className="text-success-strong" />
              <p className="font-display text-[18px] font-bold text-text-primary">Tudo configurado</p>
              <p className="text-[14px] text-text-secondary">Bio, bot, QR Code e canal prontos. Agora é divulgar o link da bio.</p>
            </div>
          )}
        </motion.div>

        {pending > 0 && (
          <motion.section variants={item} className="rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card md:p-4">
            <h2 className="mb-1 px-1 text-[16px] font-bold text-text-primary">Comece por aqui</h2>
            <ol className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
              {steps.map((step) => (
                <li key={step.title}>
                  <Link to={step.to} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-panel-hover">
                    {step.done ? <CheckCircle2 size={20} className="shrink-0 text-success" /> : <Circle size={20} className="shrink-0 text-text-secondary/40" />}
                    <span className="flex min-w-0 flex-col">
                      <span className={`truncate text-[14px] font-semibold ${step.done ? "text-text-secondary line-through decoration-text-secondary/40" : "text-text-primary"}`}>{step.title}</span>
                      <span className="truncate text-[12.5px] text-text-secondary">{step.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </motion.section>
        )}

        <motion.div variants={item}>
          <ExampleCompanies />
        </motion.div>

      </motion.div>
    </div>
  );
}
