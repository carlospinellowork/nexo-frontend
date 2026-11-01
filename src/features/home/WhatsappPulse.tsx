import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  WhatsApp,
} from "../../shared/icons";
import { motion, useReducedMotion } from "motion/react";
import type { WhatsappResults } from "../../api/queries/useGetWhatsappResults";
import { CountUp } from "./StatTile";

const WEEKDAY = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", {
    weekday: "narrow",
    timeZone: "UTC",
  });

/**
 * O número principal do Nexo: quantas pessoas foram para o WhatsApp do dono nos últimos 7 dias
 * (pela bio e pelo bot). Fica dentro do topo do Início, em vidro sobre o fundo vivo.
 */
export function WhatsappPulse({
  data,
  hasBio,
}: {
  data?: WhatsappResults;
  hasBio: boolean;
}) {
  const reduce = useReducedMotion();
  const week = data?.perDay.slice(-7) ?? [];
  const max = Math.max(1, ...week.map((d) => d.count));
  const diff = data ? data.week - data.previous : 0;

  return (
    <div className="relative mt-4 flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between md:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#25D366] text-white shadow-[0_8px_20px_rgb(37_211_102/0.4)]">
          <WhatsApp size={24} data-gesture="ring" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display text-[34px] font-bold leading-none tabular-nums md:text-[40px]">
              {data ? <CountUp value={data.week} /> : "–"}
            </span>
            {data && data.previous > 0 && diff !== 0 && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-bold ${diff > 0 ? "bg-[#25D366]/25 text-white" : "bg-white/15 text-white/80"}`}
              >
                {diff > 0 ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}
                {diff > 0 ? "+" : "−"}
                {Math.abs(diff)} que na semana passada
              </span>
            )}
          </span>
          <span className="text-[14px] font-semibold text-white/90">
            {data?.week === 1 ? "pessoa foi" : "pessoas foram"} para o seu
            WhatsApp esta semana
          </span>
          <span className="text-[12.5px] text-white/70">
            {!data
              ? " "
              : data.week > 0
                ? `${data.fromBio} pela bio · ${data.fromBot} pela conversa do bot`
                : hasBio
                  ? "Divulgue o link da bio: cada toque no WhatsApp aparece aqui."
                  : "Crie a sua bio com o seu WhatsApp e acompanhe por aqui."}
          </span>
        </div>
      </div>

      {data && data.week > 0 ? (
        <div
          className="flex h-14 items-end gap-1.5 sm:w-48"
          aria-label="Por dia, últimos 7 dias"
        >
          {week.map((d, i) => (
            <div
              key={d.date}
              className="flex h-full flex-1 flex-col items-center gap-1"
            >
              <span className="flex w-full flex-1 items-end">
                <motion.span
                  className={`block w-full rounded-[5px] ${i === week.length - 1 ? "bg-[#25D366]" : "bg-white/45"}`}
                  style={{
                    height: `${Math.max(8, (d.count / max) * 100)}%`,
                    originY: 1,
                  }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.05,
                    duration: 0.5,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  title={`${d.count} em ${d.date.split("-").reverse().join("/")}`}
                />
              </span>
              <span className="text-[10.5px] font-semibold uppercase text-white/60">
                {WEEKDAY(d.date)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        !hasBio && (
          <Link
            to="/minha-bio"
            className="nx-anim inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[11px] bg-white px-3.5 text-[14px] font-semibold text-[#1a1530] sm:w-fit"
          >
            Criar a minha bio
            <ArrowRight size={15} data-gesture="nudge" />
          </Link>
        )
      )}
    </div>
  );
}
