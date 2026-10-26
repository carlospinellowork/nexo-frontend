import { useState } from "react";

interface DailyBarsProps {
  data: { date: string; count: number }[];
  label: string;
}

const dayLabel = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", opts);

/**
 * Barras de uma série por dia: cor primária, topo arredondado, 2px de respiro entre barras,
 * dica no hover/foco e tabela para leitores de tela.
 */
export function DailyBars({ data, label }: DailyBarsProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const ticks = [max, Math.round(max / 2), 0];
  const labelEvery = data.length > 31 ? 14 : data.length > 7 ? 5 : 1;
  const current = active !== null ? data[active] : null;

  return (
    <figure className="flex flex-col gap-2">
      <div className="flex h-56 gap-2">
        <div className="flex w-8 shrink-0 flex-col justify-between pb-6 text-right text-[11px] tabular-nums text-text-secondary" aria-hidden>
          {ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
            {ticks.map((_, i) => (
              <span key={i} className="border-t border-border-ui/70" />
            ))}
          </div>
          <div className="relative flex flex-1 items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
            {data.map((d, i) => (
              <button
                key={d.date}
                type="button"
                aria-label={`${dayLabel(d.date, { day: "numeric", month: "long" })}: ${d.count} ${d.count === 1 ? "conversa" : "conversas"}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group relative flex h-full min-w-0 flex-1 items-end outline-none"
              >
                <span
                  className={`w-full rounded-t-[4px] transition-opacity ${active === null || active === i ? "opacity-100" : "opacity-45"} ${d.count ? "bg-primary" : "bg-border-ui"}`}
                  style={{ height: d.count ? `${Math.max(3, (d.count / max) * 100)}%` : "2px" }}
                />
                {active === i && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-panel px-3 py-2 text-left shadow-float">
                    <span className="block text-[12px] text-text-secondary">{dayLabel(d.date, { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span className="block text-[14px] font-bold tabular-nums text-text-primary">
                      {d.count} {d.count === 1 ? "conversa" : "conversas"}
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex h-6 items-end gap-[2px] text-[11px] text-text-secondary" aria-hidden>
            {data.map((d, i) => (
              <span key={d.date} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center">
                {(data.length - 1 - i) % labelEvery === 0 ? dayLabel(d.date, { day: "numeric", month: "numeric" }) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="sr-only">{label}</figcaption>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Conversas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{dayLabel(d.date, { day: "numeric", month: "long" })}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {current === null && <span className="sr-only">Passe o mouse ou use Tab nas barras para ver cada dia.</span>}
    </figure>
  );
}
