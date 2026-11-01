import { Link } from "@tanstack/react-router";
import { ArrowRight, Headset } from "lucide-react";
import type { ReactNode } from "react";
import { MeshBackground } from "../auth/components/MeshBackground";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

interface HomeHeroProps {
  firstName?: string;
  /** Conversas de hoje e dos últimos 7 dias; undefined enquanto carrega. */
  today?: number;
  week?: number;
  /** Pessoas que o bot transferiu e estão esperando resposta. */
  waiting: number;
  actions?: ReactNode;
  /** Destaque logo abaixo da saudação (quem foi para o WhatsApp). */
  children?: ReactNode;
}

/** Topo do Início: o fundo vivo da marca, a saudação e o resumo do dia com números reais. */
export function HomeHero({ firstName, today, week, waiting, actions, children }: HomeHeroProps) {
  const raw = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const date = raw.charAt(0).toUpperCase() + raw.slice(1);
  const summary =
    today === undefined || week === undefined
      ? " "
      : today > 0
        ? `${today} ${today === 1 ? "conversa" : "conversas"} hoje, ${week} nos últimos 7 dias.`
        : week > 0
          ? `${week} ${week === 1 ? "conversa" : "conversas"} nos últimos 7 dias.`
          : "Tudo pronto para receber os seus primeiros contatos.";

  return (
    <section className="relative isolate overflow-hidden rounded-2xl px-4 py-5 text-white shadow-float md:px-6 md:py-6">
      <MeshBackground />
      {/* Escurece o lado do texto: o branco lê bem mesmo quando as luzes passam por trás. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0d0a1f]/55 via-[#0d0a1f]/20 to-transparent" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-medium text-white/75">{date}</span>
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="min-h-[20px] text-[14px] text-white/80">{summary}</p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      {children}
      {waiting > 0 && (
        <Link
          to="/leads"
          className="nx-anim relative mt-4 flex w-full items-center gap-2.5 rounded-xl border border-white/20 bg-white/12 px-3 py-2.5 text-[14px] font-semibold backdrop-blur-xl transition-colors hover:bg-white/18 sm:w-fit"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <Headset size={16} data-gesture="ring" />
          {waiting} {waiting === 1 ? "pessoa esperando" : "pessoas esperando"} atendimento
          <ArrowRight size={15} data-gesture="nudge" className="ml-auto sm:ml-1" />
        </Link>
      )}
    </section>
  );
}
