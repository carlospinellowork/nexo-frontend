import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useGetBookingsRange } from "../../api/queries/useGetBookingsRange";
import { Segmented } from "../../shared/components/ui/Segmented";
import { CalendarCheck, ChevronLeft, ChevronRight, Clock, Lock, Users } from "../../shared/icons";
import { DayPanel } from "./DayPanel";
import { type AgendaBlock, type AgendaData, type Booking, dayIn, shiftDay, timeIn, weekdayOf } from "./types";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOUR_PX = 60;

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
/** A semana começa na segunda. */
const weekStart = (date: string) => shiftDay(date, -((weekdayOf(date) + 6) % 7));
const monthOf = (date: string) => date.slice(0, 7);
const shiftMonth = (month: string, by: number) => {
  const d = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + by, 1));
  return d.toISOString().slice(0, 7);
};
const monthLabel = (month: string) => new Date(`${month}-15T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC", month: "long", year: "numeric" });
const dayNumber = (date: string) => Number(date.slice(8, 10));
const rangeLabel = (from: string, to: string) => {
  const fmt = (d: string, month: boolean) => new Date(`${d}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "numeric", ...(month ? { month: "long" as const } : {}) });
  if (from === to) return new Date(`${from}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
  return `${fmt(from, monthOf(from) !== monthOf(to))} a ${fmt(to, true)}`;
};

function groupByDay(bookings: Booking[] | undefined, timeZone: string) {
  const map = new Map<string, Booking[]>();
  for (const b of bookings ?? []) {
    const day = dayIn(timeZone, new Date(b.startsAt));
    map.set(day, [...(map.get(day) ?? []), b]);
  }
  return map;
}

const isBlocked = (blocks: AgendaBlock[], date: string, timeZone: string) => blocks.find((b) => dayIn(timeZone, new Date(b.startsAt)) <= date && date < dayIn(timeZone, new Date(b.endsAt)));

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/** O mês em tela cheia: cada dia já mostra quem vem. Clicar abre o dia no painel ao lado. */
function MonthBoard({ agenda, month, direction, selected, today, onPick }: { agenda: AgendaData; month: string; direction: number; selected: string; today: string; onPick: (date: string) => void }) {
  const { timeZone } = agenda.config;
  const reduce = useReducedMotion();
  const first = weekStart(`${month}-01`);
  const days = Array.from({ length: 42 }, (_, i) => shiftDay(first, i));
  const { data } = useGetBookingsRange(days[0], days[41]);
  const byDay = useMemo(() => groupByDay(data, timeZone), [data, timeZone]);

  return (
    <section aria-label="Calendário do mês" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-ui/70 bg-panel shadow-card">
      <div className="grid shrink-0 grid-cols-7 border-b border-border-ui/70 text-[12px] font-semibold text-text-secondary">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <span key={d} className="px-2.5 py-2">
            {d}
          </span>
        ))}
      </div>
      <motion.div key={month} initial={reduce ? false : { opacity: 0, x: direction * 24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 380, damping: 34 }} className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {days.map((date, index) => {
          const all = byDay.get(date) ?? [];
          const list = all.filter((b) => b.status !== "CANCELLED");
          const pending = list.filter((b) => b.status === "PENDING").length;
          const blocked = isBlocked(agenda.blocks, date, timeZone);
          const inMonth = monthOf(date) === month;
          const closed = !agenda.config.hours.some((h) => h.day === weekdayOf(date));
          const isSelected = date === selected;
          return (
            <button
              key={date}
              type="button"
              aria-label={`${rangeLabel(date, date)}: ${list.length === 1 ? "1 reserva" : `${list.length} reservas`}${pending ? `, ${pending} para confirmar` : ""}${blocked ? ", bloqueado" : ""}`}
              aria-current={date === today ? "date" : undefined}
              aria-pressed={isSelected}
              onClick={() => onPick(date)}
              className={`group relative flex min-h-0 flex-col gap-1 overflow-hidden border-border-ui/50 p-1.5 text-left transition-colors hover:bg-primary/5 ${index % 7 ? "border-l" : ""} ${index >= 7 ? "border-t" : ""} ${blocked && inMonth ? "bg-warning/8" : closed || !inMonth ? "bg-text-secondary/[0.035]" : ""}`}
            >
              {isSelected && <motion.span layoutId="agenda-selected-day" transition={{ type: "spring", stiffness: 480, damping: 36 }} className="absolute inset-0.5 rounded-xl border-2 border-primary bg-primary/8" />}
              <span className="relative flex items-center justify-between">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13.5px] font-semibold tabular-nums ${date === today ? "bg-primary text-white" : inMonth ? "text-text-primary" : "text-text-secondary/45"}`}>{dayNumber(date)}</span>
                {blocked ? (
                  <Lock size={13} className="mr-1 text-warning-strong" />
                ) : list.length > 0 ? (
                  <span className={`mr-0.5 rounded-full px-1.5 text-[11.5px] font-bold tabular-nums ${pending ? "bg-warning/18 text-warning-strong" : "bg-primary/12 text-primary-strong"}`}>{list.length}</span>
                ) : null}
              </span>
              {list.length > 0 && (
                <span className="relative hidden min-h-0 flex-col gap-0.5 overflow-hidden 2xl:flex">
                  {list.slice(0, 4).map((b, i) => (
                    <motion.span key={b.id} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 500, damping: 32, delay: reduce ? 0 : i * 0.04 }} className={`truncate rounded-md px-1.5 py-0.5 text-[12px] font-medium ${b.status === "PENDING" ? "bg-warning/16 text-warning-strong" : "bg-primary/10 text-text-primary"}`}>
                      <span className="font-semibold tabular-nums">{timeIn(b.startsAt, timeZone)}</span> {b.customerName.split(/\s+/)[0]}
                    </motion.span>
                  ))}
                  {list.length > 4 && <span className="pl-1.5 text-[11.5px] font-semibold text-text-secondary">mais {list.length - 4}</span>}
                </span>
              )}
              {list.length > 0 && (
                <span className="relative mt-auto flex items-center pl-0.5 2xl:hidden">
                  {list.slice(0, 3).map((b, i) => (
                    <motion.span
                      key={b.id}
                      initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28, delay: reduce ? 0 : i * 0.05 }}
                      title={`${timeIn(b.startsAt, timeZone)} ${b.customerName}`}
                      className={`-ml-1 flex h-[23px] w-[23px] items-center justify-center rounded-full border-2 border-panel text-[9.5px] font-bold first:ml-0 ${b.status === "PENDING" ? "bg-warning/25 text-warning-strong" : "bg-primary/18 text-primary-strong"}`}
                    >
                      {initials(b.customerName)}
                    </motion.span>
                  ))}
                  {list.length > 3 && <span className="ml-1 text-[11.5px] font-semibold text-text-secondary">+{list.length - 3}</span>}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>
    </section>
  );
}

/** Reservas que se sobrepõem (só acontece com canceladas) ficam lado a lado. */
function withLanes(list: Booking[]) {
  const ends: number[] = [];
  const placed = list.map((b) => {
    const start = Date.parse(b.startsAt);
    let lane = ends.findIndex((end) => end <= start);
    if (lane === -1) lane = ends.length;
    ends[lane] = Date.parse(b.endsAt);
    return { booking: b, lane };
  });
  return placed.map((p) => ({ ...p, lanes: Math.max(1, ends.length) }));
}

const BLOCK_STYLE: Record<Booking["status"], string> = {
  CONFIRMED: "border-primary bg-primary/12 text-text-primary hover:bg-primary/18",
  PENDING: "border-warning bg-warning/16 text-text-primary hover:bg-warning/24",
  CANCELLED: "border-border-ui bg-panel-2 text-text-secondary line-through opacity-70 hover:opacity-100",
};

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/** A semana (ou o dia) em grade de horários: a altura de cada reserva é a duração dela. */
function TimeGrid({ agenda, days, bookings, today, selected, direction, activeId, onSelect, onDay }: { agenda: AgendaData; days: string[]; bookings: Map<string, Booking[]>; today: string; selected: string; direction: number; activeId: string | null; onSelect: (b: Booking) => void; onDay: (date: string) => void }) {
  const { timeZone, hours } = agenda.config;
  const reduce = useReducedMotion();
  const now = useNow();
  const minutesOf = (iso: string) => toMinutes(timeIn(iso, timeZone));
  const all = days.flatMap((d) => bookings.get(d) ?? []);
  const opens = hours.filter((h) => days.some((d) => weekdayOf(d) === h.day));
  const start = Math.floor(Math.min(9 * 60, ...opens.map((h) => toMinutes(h.start)), ...all.map((b) => minutesOf(b.startsAt))) / 60) * 60;
  const end = Math.ceil(Math.max(18 * 60, ...opens.map((h) => toMinutes(h.end)), ...all.map((b) => minutesOf(b.endsAt))) / 60) * 60;
  const top = (minutes: number) => ((minutes - start) / 60) * HOUR_PX;
  const hourMarks = Array.from({ length: (end - start) / 60 + 1 }, (_, i) => start + i * 60);
  const columns = `56px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border-ui/70 bg-panel shadow-card">
      <div className="sticky top-0 z-20 grid border-b border-border-ui bg-panel/95 backdrop-blur" style={{ gridTemplateColumns: columns }}>
        <span />
        {days.map((date) => {
          const count = (bookings.get(date) ?? []).filter((b) => b.status !== "CANCELLED").length;
          return (
            <button key={date} type="button" onClick={() => onDay(date)} aria-label={`Ver só ${rangeLabel(date, date)}`} className={`flex flex-col items-center gap-0.5 border-l border-border-ui/50 py-2 transition-colors hover:bg-panel-hover ${date === selected ? "bg-primary/6" : ""}`}>
              <span className="text-[12px] font-semibold text-text-secondary">{WEEKDAYS[weekdayOf(date)]}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-[16px] font-bold tabular-nums ${date === today ? "bg-primary text-white" : "text-text-primary"}`}>{dayNumber(date)}</span>
              <span className="h-4 text-[11.5px] font-medium text-text-secondary">{count ? (count === 1 ? "1 reserva" : `${count} reservas`) : ""}</span>
            </button>
          );
        })}
      </div>

      <motion.div key={days[0] + days.length} initial={reduce ? false : { opacity: 0, x: direction * 28 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 380, damping: 34 }} className="relative grid" style={{ gridTemplateColumns: columns, height: top(end) + 8 }}>
        <div className="relative">
          {hourMarks.map((m) => (
            <span key={m} className="absolute right-2 -translate-y-1/2 text-[11.5px] tabular-nums text-text-secondary" style={{ top: top(m) + 4 }}>
              {String(m / 60).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {days.map((date) => {
          const blocked = isBlocked(agenda.blocks, date, timeZone);
          const open = hours.filter((h) => h.day === weekdayOf(date));
          const list = withLanes(bookings.get(date) ?? []);
          const nowMinutes = toMinutes(timeIn(now.toISOString(), timeZone));
          return (
            <div key={date} className="relative border-l border-border-ui/50 bg-text-secondary/5">
              {!blocked &&
                open.map((h) => (
                  <span key={h.start} aria-hidden className="absolute inset-x-0 bg-panel" style={{ top: top(toMinutes(h.start)) + 4, height: top(toMinutes(h.end)) - top(toMinutes(h.start)) }} />
                ))}
              {hourMarks.map((m) => (
                <span key={m} aria-hidden className="absolute inset-x-0 border-t border-border-ui/45" style={{ top: top(m) + 4 }} />
              ))}
              {blocked && (
                <span className="absolute inset-0 flex items-start justify-center bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,var(--nx-warning-soft,rgba(245,158,11,.1))_8px,var(--nx-warning-soft,rgba(245,158,11,.1))_16px)] pt-3 text-center text-[12px] font-semibold text-warning-strong">
                  <span className="inline-flex items-center gap-1 rounded-full bg-panel px-2 py-0.5 shadow-sm">
                    <Lock size={12} /> {blocked.reason ?? "Bloqueado"}
                  </span>
                </span>
              )}
              {list.map(({ booking: b, lane, lanes }, i) => {
                const y = top(minutesOf(b.startsAt)) + 4;
                const height = Math.max(24, top(minutesOf(b.endsAt)) - top(minutesOf(b.startsAt)) - 2);
                return (
                  <motion.button
                    key={b.id}
                    type="button"
                    initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30, delay: reduce ? 0 : i * 0.03 }}
                    whileHover={reduce ? undefined : { y: -1 }}
                    onClick={() => onSelect(b)}
                    aria-label={`${timeIn(b.startsAt, timeZone)}, ${b.customerName}, ${b.serviceName}`}
                    className={`absolute z-10 flex flex-col overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left transition-colors ${BLOCK_STYLE[b.status]} ${activeId === b.id ? "ring-2 ring-primary ring-offset-1 ring-offset-panel" : ""}`}
                    style={{ top: y, height, left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                  >
                    {height > 40 ? (
                      <>
                        <span className="truncate text-[11.5px] font-semibold tabular-nums leading-tight text-text-secondary">{timeIn(b.startsAt, timeZone)}</span>
                        <span className="truncate text-[12.5px] font-bold leading-snug">{b.customerName}</span>
                        {height > 64 && <span className="truncate text-[11.5px] leading-tight text-text-secondary">{b.serviceName}</span>}
                      </>
                    ) : (
                      <span className="truncate text-[12px] font-bold leading-tight">
                        <span className="tabular-nums">{timeIn(b.startsAt, timeZone)}</span> {b.customerName.split(/\s+/)[0]}
                      </span>
                    )}
                  </motion.button>
                );
              })}
              {date === today && nowMinutes >= start && nowMinutes <= end && (
                <span aria-hidden className="absolute inset-x-0 z-[15] flex items-center" style={{ top: top(nowMinutes) + 4 }}>
                  <motion.span animate={reduce ? undefined : { scale: [1, 1.35, 1] }} transition={{ duration: 2.4, repeat: Infinity }} className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-danger" />
                  <span className="h-px flex-1 bg-danger" />
                </span>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/** Números da semana atual, sempre à vista. */
function WeekPulse({ agenda, today, onPick }: { agenda: AgendaData; today: string; onPick: (date: string) => void }) {
  const from = weekStart(today);
  const { data } = useGetBookingsRange(from, shiftDay(from, 6));
  const { timeZone } = agenda.config;
  const live = (data ?? []).filter((b) => b.status !== "CANCELLED");
  const pending = live.filter((b) => b.status === "PENDING");
  const todayCount = live.filter((b) => dayIn(timeZone, new Date(b.startsAt)) === today).length;
  const stats = [
    { label: "Hoje", value: todayCount, icon: Clock, date: today, warn: false },
    { label: "Esta semana", value: live.length, icon: CalendarCheck, date: today, warn: false },
    { label: "Para confirmar", value: pending.length, icon: Users, date: pending[0] ? dayIn(timeZone, new Date(pending[0].startsAt)) : today, warn: pending.length > 0 },
  ];
  return (
    <div className="flex items-center gap-2">
      {stats.map((s) => (
        <button key={s.label} type="button" title={s.label} aria-label={`${s.label}: ${s.value}`} onClick={() => onPick(s.date)} className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[12.5px] font-medium transition-colors ${s.warn ? "border-warning/40 bg-warning/10 text-warning-strong hover:bg-warning/16" : "border-border-ui/70 bg-panel text-text-secondary hover:bg-panel-hover"}`}>
          <s.icon size={14} />
          <span className="hidden 2xl:inline">{s.label}</span>
          <span className={`font-display text-[15px] font-bold tabular-nums ${s.warn ? "" : "text-text-primary"}`}>{s.value}</span>
        </button>
      ))}
    </div>
  );
}

/** A agenda no computador: o calendário de um lado e, do outro, as pessoas do dia escolhido. */
export function DesktopAgenda({ agenda, date, onDate, onSetup }: { agenda: AgendaData; date: string; onDate: (date: string) => void; onSetup: () => void }) {
  const { timeZone } = agenda.config;
  const [view, setView] = useState<"month" | "week">("month");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [month, setMonth] = useState(monthOf(date));
  const today = dayIn(timeZone);
  const from = weekStart(date);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => shiftDay(from, i)), [from]);
  const { data } = useGetBookingsRange(from, days[6]);
  const byDay = useMemo(() => groupByDay(data, timeZone), [data, timeZone]);

  const pick = (next: string) => {
    if (monthOf(next) !== month) {
      setDirection(next > `${month}-01` ? 1 : -1);
      setMonth(monthOf(next));
    }
    if (next === date) return;
    setDirection(next > date ? 1 : -1);
    setActiveId(null);
    onDate(next);
  };
  const shift = (by: number) => {
    setDirection(by);
    if (view === "month") setMonth(shiftMonth(month, by));
    else pick(shiftDay(date, by * 7));
  };

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_380px] gap-4 2xl:grid-cols-[minmax(0,1fr)_440px]">
      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 truncate whitespace-nowrap font-display text-[19px] font-bold tracking-tight text-text-primary first-letter:uppercase 2xl:text-[22px]">{view === "month" ? monthLabel(month) : rangeLabel(from, days[6])}</h2>
          <div className="flex items-center rounded-xl border border-border-ui/70 bg-panel p-0.5">
            <button type="button" aria-label={view === "month" ? "Mês anterior" : "Semana anterior"} onClick={() => shift(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => pick(today)}
              className="h-8 rounded-lg px-3 text-[13.5px] font-semibold text-text-primary hover:bg-panel-hover"
            >
              Hoje
            </button>
            <button type="button" aria-label={view === "month" ? "Próximo mês" : "Próxima semana"} onClick={() => shift(1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <WeekPulse agenda={agenda} today={today} onPick={pick} />
            <Segmented
              label="Mostrar"
              size="sm"
              value={view}
              onChange={(v) => {
                setView(v);
                setMonth(monthOf(date));
              }}
              options={[
                { value: "month", label: "Mês" },
                { value: "week", label: "Semana" },
              ]}
            />
          </div>
        </div>
        {view === "month" ? (
          <MonthBoard agenda={agenda} month={month} direction={direction} selected={date} today={today} onPick={pick} />
        ) : (
          <TimeGrid
            agenda={agenda}
            days={days}
            bookings={byDay}
            today={today}
            selected={date}
            direction={direction}
            activeId={activeId}
            onSelect={(b) => {
              pick(dayIn(timeZone, new Date(b.startsAt)));
              setActiveId(b.id);
            }}
            onDay={pick}
          />
        )}
      </div>
      <DayPanel agenda={agenda} date={date} direction={direction} activeId={activeId} onActive={setActiveId} onSetup={onSetup} className="min-h-0 overflow-y-auto rounded-2xl border border-border-ui/70 bg-panel shadow-card" />
    </div>
  );
}
