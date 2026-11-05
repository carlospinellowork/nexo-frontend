import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { useGetBookingsRange } from "../../api/queries/useGetBookingsRange";
import { ChevronLeft, ChevronRight } from "../../shared/icons";
import { DayPanel } from "./DayPanel";
import { type AgendaData, dayIn, shiftDay, weekdayOf } from "./types";

const LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];
const weekStart = (date: string) => shiftDay(date, -((weekdayOf(date) + 6) % 7));

/** A agenda no celular: uma faixa com a semana ao alcance do polegar e, embaixo, as pessoas do dia. */
export function MobileAgenda({ agenda, date, onDate, onSetup }: { agenda: AgendaData; date: string; onDate: (date: string) => void; onSetup: () => void }) {
  const { timeZone } = agenda.config;
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const today = dayIn(timeZone);
  const from = weekStart(date);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => shiftDay(from, i)), [from]);
  const { data } = useGetBookingsRange(from, days[6]);
  const counts = useMemo(() => {
    const map = new Map<string, { total: number; pending: boolean }>();
    for (const b of data ?? []) {
      if (b.status === "CANCELLED") continue;
      const key = dayIn(timeZone, new Date(b.startsAt));
      const cur = map.get(key) ?? { total: 0, pending: false };
      map.set(key, { total: cur.total + 1, pending: cur.pending || b.status === "PENDING" });
    }
    return map;
  }, [data, timeZone]);

  const pick = (next: string) => {
    setDirection(next > date ? 1 : -1);
    setActiveId(null);
    onDate(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <section aria-label="Semana" className="flex items-center gap-0.5 rounded-2xl border border-border-ui/70 bg-panel p-1 shadow-card">
        <button type="button" aria-label="Semana anterior" onClick={() => pick(shiftDay(date, -7))} className="flex h-14 w-7 shrink-0 items-center justify-center text-text-secondary">
          <ChevronLeft size={18} />
        </button>
        <motion.div key={from} initial={reduce ? false : { opacity: 0, x: direction * 18 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="grid min-w-0 flex-1 grid-cols-7">
          {days.map((d) => {
            const count = counts.get(d);
            const selected = d === date;
            return (
              <button key={d} type="button" aria-pressed={selected} aria-current={d === today ? "date" : undefined} aria-label={`Dia ${Number(d.slice(8, 10))}: ${count?.total ?? 0} reservas`} onClick={() => pick(d)} className="relative flex h-14 flex-col items-center justify-center gap-0.5">
                {selected && <motion.span layoutId="agenda-mobile-day" transition={{ type: "spring", stiffness: 500, damping: 36 }} className="absolute inset-x-0.5 inset-y-0 rounded-xl bg-primary" />}
                <span className={`relative text-[11px] font-semibold ${selected ? "text-white/80" : "text-text-secondary"}`}>{LETTERS[weekdayOf(d)]}</span>
                <span className={`relative text-[15px] font-bold tabular-nums ${selected ? "text-white" : d === today ? "text-primary-strong" : "text-text-primary"}`}>{Number(d.slice(8, 10))}</span>
                <span className={`relative h-1 w-1 rounded-full ${!count ? "" : selected ? "bg-white" : count.pending ? "bg-warning" : "bg-primary"}`} />
              </button>
            );
          })}
        </motion.div>
        <button type="button" aria-label="Próxima semana" onClick={() => pick(shiftDay(date, 7))} className="flex h-14 w-7 shrink-0 items-center justify-center text-text-secondary">
          <ChevronRight size={18} />
        </button>
      </section>
      <DayPanel agenda={agenda} date={date} direction={direction} activeId={activeId} onActive={setActiveId} onSetup={onSetup} className="overflow-hidden rounded-2xl border border-border-ui/70 bg-panel shadow-card" />
    </div>
  );
}
