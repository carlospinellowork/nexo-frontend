import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, type IconComponent } from "../../shared/icons";
import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { gestureFor } from "../../shared/components/ui/gestures";
import { type Tone, TONES } from "../../shared/components/ui/tones";

/** Número que conta até o valor ao aparecer (fica parado para quem pede menos movimento). */
export function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [value, reduce]);
  return <>{shown.toLocaleString("pt-BR")}</>;
}

/** Mini gráfico de linha que se desenha ao aparecer. */
function Sparkline({ points, tone }: { points: number[]; tone: Tone }) {
  const id = useId();
  const reduce = useReducedMotion();
  const max = Math.max(1, ...points);
  const step = points.length > 1 ? 100 / (points.length - 1) : 100;
  const coords = points.map((v, i) => [i * step, 26 - (v / max) * 22] as const);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L100 28 L0 28 Z`;
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={`h-7 w-full ${TONES[tone].text}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <motion.path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </svg>
  );
}

interface StatTileProps {
  label: string;
  value: number | undefined;
  icon: IconComponent;
  tone: Tone;
  to: string;
  /** Valor da semana anterior, para a variação. */
  previous?: number;
  /** Série diária para o mini gráfico. */
  series?: number[];
  /** Texto quando não há comparação (ex.: "nos últimos 7 dias"). */
  hint?: string;
}

/** Número do Início: valor real dos últimos 7 dias, variação contra a semana anterior e mini gráfico. */
export function StatTile({ label, value, icon: Icon, tone, to, previous, series, hint = "nos últimos 7 dias" }: StatTileProps) {
  const t = TONES[tone];
  const delta = value !== undefined && previous !== undefined && previous > 0 ? Math.round(((value - previous) / previous) * 100) : undefined;
  const up = (delta ?? 0) >= 0;
  return (
    <Link to={to} className="nx-anim group flex min-w-0 flex-col gap-2 rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-float">
      <span className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.chip}`}>
          <Icon size={15} strokeWidth={2.2} data-gesture={gestureFor(Icon)} />
        </span>
        <span className="min-w-0 truncate text-[13px] font-semibold text-text-secondary">{label}</span>
      </span>
      <span className="font-display text-[28px] font-bold leading-none tracking-[-0.03em] tabular-nums text-text-primary">
        {value === undefined ? <span className="inline-block h-7 w-12 animate-pulse rounded-md bg-panel-hover align-middle" /> : <CountUp value={value} />}
      </span>
      <span className="flex min-h-[18px] items-center gap-1 text-[12px] text-text-secondary">
        {delta !== undefined && delta !== 0 ? (
          <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? "text-success-strong" : "text-danger-strong"}`}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {up ? "+" : ""}
            {delta}%
          </span>
        ) : null}
        <span className="truncate">{delta !== undefined && delta !== 0 ? "contra a semana anterior" : hint}</span>
      </span>
      {/* Sem nenhum valor, a linha seria reta e não diria nada: não mostra. */}
      {series && series.length > 1 && series.some((v) => v > 0) && <Sparkline points={series} tone={tone} />}
    </Link>
  );
}
