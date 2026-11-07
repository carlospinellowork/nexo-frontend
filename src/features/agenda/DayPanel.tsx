import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useBookingAction } from "../../api/mutations/useAgendaMutations";
import { useGetBookings } from "../../api/queries/useGetBookings";
import { Badge } from "../../shared/components/ui/Badge";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "../../shared/components/ui/toast-store";
import { Calendar, CheckCircle2, ChevronDown, Clock, Lock, Phone, Plus, WhatsApp, X } from "../../shared/icons";
import { type AgendaData, type Booking, dayIn, durationLabel, longDay, money, revenueOf, timeIn, weekdayOf, whatsappOfCustomer } from "./types";

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const STATUS = {
  PENDING: <Badge tone="warning">Para confirmar</Badge>,
  CONFIRMED: <Badge tone="success">Confirmada</Badge>,
  CANCELLED: <Badge tone="neutral">Cancelada</Badge>,
};

/** Abre o WhatsApp do cliente com o lembrete escrito: é o dono que envia, sem API e sem custo. */
function reminderLink(booking: Booking, timeZone: string) {
  const day = new Date(booking.startsAt).toLocaleDateString("pt-BR", { timeZone, weekday: "long", day: "2-digit", month: "2-digit" });
  const text = `Oi, ${booking.customerName}! Passando para lembrar do seu horário de ${booking.serviceName}: ${day}, às ${timeIn(booking.startsAt, timeZone)}. Até lá!`;
  return `${whatsappOfCustomer(booking.customerPhone)}?text=${encodeURIComponent(text)}`;
}

function PersonRow({ booking, timeZone, open, onToggle, onMove, onCancelled }: { booking: Booking; timeZone: string; open: boolean; onToggle: () => void; onMove: (b: Booking) => void; onCancelled: (b: Booking) => void }) {
  const { mutateAsync, isPending, variables } = useBookingAction();
  const reduce = useReducedMotion();
  const cancelled = booking.status === "CANCELLED";
  const upcoming = !cancelled && Date.parse(booking.startsAt) > Date.now();
  const minutes = Math.round((Date.parse(booking.endsAt) - Date.parse(booking.startsAt)) / 60_000);

  const run = async (action: "confirm" | "cancel") => {
    if (action === "cancel" && !confirm(`Cancelar a reserva de ${booking.customerName}? O horário volta a ficar livre.`)) return;
    try {
      const updated = await mutateAsync({ id: booking.id, action });
      toast.success(action === "confirm" ? "Reserva confirmada." : "Reserva cancelada.");
      if (action === "cancel") onCancelled(updated);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível atualizar a reserva."));
    }
  };

  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors ${open ? "border-primary/50 bg-primary/5 shadow-card" : booking.status === "PENDING" ? "border-warning/40 bg-warning/5 hover:bg-warning/10" : "border-border-ui/70 bg-panel hover:bg-panel-hover"} ${cancelled ? "opacity-60" : ""}`}>
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-14 w-full items-center gap-2.5 p-2.5 text-left">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${booking.status === "PENDING" ? "bg-warning/20 text-warning-strong" : cancelled ? "bg-text-secondary/15 text-text-secondary" : "bg-primary/14 text-primary-strong"}`}>{initials(booking.customerName)}</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={`truncate text-[14.5px] font-semibold text-text-primary ${cancelled ? "line-through" : ""}`}>{booking.customerName}</span>
          <span className="truncate text-[13px] text-text-secondary">
            {booking.serviceName}
            {booking.staffName && ` com ${booking.staffName}`} · {durationLabel(minutes)}
            {booking.priceCents != null && ` · ${money(booking.priceCents)}`}
          </span>
        </span>
        {booking.status === "PENDING" && !open && <span className="h-2 w-2 shrink-0 rounded-full bg-warning" aria-label="Para confirmar" />}
        <ChevronDown size={16} className={`shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 36 }} className="overflow-hidden">
            <div className="flex flex-col gap-2.5 border-t border-border-ui/60 p-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS[booking.status]}
                {booking.customerPhone && (
                  <span className="inline-flex items-center gap-1 text-[13px] tabular-nums text-text-secondary">
                    <Phone size={13} /> {booking.customerPhone}
                  </span>
                )}
              </div>
              {booking.note && <p className="whitespace-pre-wrap break-words rounded-xl bg-panel-2 px-3 py-2 text-[13.5px] text-text-primary">{booking.note}</p>}
              <div className="flex flex-wrap gap-2">
                {booking.status === "PENDING" && (
                  <Button icon={CheckCircle2} className="h-11 w-full md:h-9" loading={isPending && variables?.action === "confirm"} onClick={() => void run("confirm")}>
                    Confirmar
                  </Button>
                )}
                {booking.customerPhone && (
                  <a href={upcoming ? reminderLink(booking, timeZone) : whatsappOfCustomer(booking.customerPhone)} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-1.5 rounded-xl border border-border-ui bg-panel px-3 text-[14px] font-semibold text-text-primary hover:bg-panel-hover md:h-9">
                    <WhatsApp size={16} /> {upcoming ? "Lembrar" : "WhatsApp"}
                  </a>
                )}
                {!cancelled && (
                  <button type="button" onClick={() => onMove(booking)} className="flex h-11 items-center gap-1.5 rounded-xl border border-border-ui bg-panel px-3 text-[14px] font-semibold text-text-primary hover:bg-panel-hover md:h-9">
                    <Clock size={15} /> Remarcar
                  </button>
                )}
                {!cancelled && (
                  <Button variant="ghost" icon={X} className="h-11 md:h-9" loading={isPending && variables?.action === "cancel"} onClick={() => void run("cancel")}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Item = { kind: "booking"; at: number; booking: Booking } | { kind: "free"; at: number; end: number } | { kind: "now"; at: number };

/** O dia em ordem: pessoas, horários livres entre elas e a marca de agora. */
function buildDay(date: string, bookings: Booking[], agenda: AgendaData, today: string) {
  const { timeZone, hours } = agenda.config;
  const minutesOf = (iso: string) => toMinutes(timeIn(iso, timeZone));
  const live = bookings.filter((b) => b.status !== "CANCELLED");
  const intervals = hours.filter((h) => h.day === weekdayOf(date)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const openMinutes = intervals.reduce((sum, h) => sum + toMinutes(h.end) - toMinutes(h.start), 0);
  const busyMinutes = live.reduce((sum, b) => sum + (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000, 0);
  const items: Item[] = bookings.map((b) => ({ kind: "booking", at: minutesOf(b.startsAt), booking: b }));
  const now = toMinutes(timeIn(new Date().toISOString(), timeZone));
  if (date >= today) {
    for (const interval of intervals) {
      let cursor = toMinutes(interval.start);
      if (date === today) cursor = Math.max(cursor, now);
      const end = toMinutes(interval.end);
      for (const b of live.filter((x) => minutesOf(x.endsAt) > cursor && minutesOf(x.startsAt) < end).sort((x, y) => minutesOf(x.startsAt) - minutesOf(y.startsAt))) {
        if (minutesOf(b.startsAt) - cursor >= 30) items.push({ kind: "free", at: cursor, end: minutesOf(b.startsAt) });
        cursor = Math.max(cursor, minutesOf(b.endsAt));
      }
      if (end - cursor >= 30) items.push({ kind: "free", at: cursor, end });
    }
  }
  if (date === today) items.push({ kind: "now", at: now });
  // No mesmo minuto, a reserva vem antes do "agora" e do horário livre.
  const order = { booking: 0, now: 1, free: 2 };
  items.sort((a, b) => a.at - b.at || order[a.kind] - order[b.kind]);
  const next = date === today ? live.find((b) => Date.parse(b.startsAt) > Date.now()) : undefined;
  return { items, live, openMinutes, busyMinutes, next };
}

/** O dia escolhido: as pessoas entram em sequência, cada uma no seu horário. Serve ao computador e ao celular. */
export function DayPanel({ agenda, date, direction, activeId, onActive, onSetup, onNew, onMove, onCancelled, className = "" }: { agenda: AgendaData; date: string; direction: number; activeId: string | null; onActive: (id: string | null) => void; onSetup: () => void; onNew: (date: string, time?: string) => void; onMove: (b: Booking) => void; onCancelled: (b: Booking) => void; className?: string }) {
  const { timeZone } = agenda.config;
  const { blocks, services } = agenda;
  const reduce = useReducedMotion();
  const today = dayIn(timeZone);
  const { data, isPlaceholderData, isLoading } = useGetBookings(date);
  // Enquanto o dia novo carrega, nunca mostra as pessoas do dia anterior.
  // Com equipe, dá para ver o dia de uma pessoa só.
  const team = agenda.staff.filter((m) => m.active);
  const [person, setPerson] = useState<string | null>(null);
  const bookings = isPlaceholderData ? undefined : person ? data?.filter((b) => b.staffId === person) : data;
  const day = useMemo(() => buildDay(date, bookings ?? [], agenda, today), [date, bookings, agenda, today]);
  const blocked = blocks.filter((b) => dayIn(timeZone, new Date(b.startsAt)) <= date && date < dayIn(timeZone, new Date(b.endsAt)));
  const closed = !agenda.config.hours.some((h) => h.day === weekdayOf(date));
  const occupation = day.openMinutes ? Math.min(100, Math.round((day.busyMinutes / day.openMinutes) * 100)) : 0;
  const pendingCount = day.live.filter((b) => b.status === "PENDING").length;
  const [weekday, rest] = longDay(date).split(", ");
  const loading = isLoading || isPlaceholderData;

  return (
    <aside aria-label="Pessoas do dia" className={`flex flex-col ${className}`}>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div key={date} initial={reduce ? false : { opacity: 0, x: direction * 28 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: direction * -20 }} transition={{ type: "spring", stiffness: 460, damping: 36, mass: 0.7 }} className="flex flex-col">
          <header className="sticky top-0 z-10 flex flex-col gap-2 border-b border-border-ui/60 bg-panel/95 p-4 backdrop-blur">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-[22px] font-bold leading-tight tracking-tight text-text-primary first-letter:uppercase">{date === today ? "Hoje" : weekday}</h2>
              <span className="text-[13.5px] font-medium text-text-secondary">{date === today ? `${weekday}, ${rest}` : rest}</span>
            </div>
            <p className="flex flex-wrap items-center gap-x-2 text-[13.5px] text-text-secondary">
              <span className="font-semibold text-text-primary">{day.live.length === 1 ? "1 pessoa" : `${day.live.length} pessoas`}</span>
              {pendingCount > 0 && <span className="font-semibold text-warning-strong">· {pendingCount} para confirmar</span>}
              {day.next && <span>· próxima às {timeIn(day.next.startsAt, timeZone)}</span>}
              {revenueOf(day.live) > 0 && <span>· {money(revenueOf(day.live))} previstos</span>}
            </p>
            {day.openMinutes > 0 && blocked.length === 0 && (
              <div className="flex items-center gap-2" title="Quanto do horário de atendimento já está reservado">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-text-secondary/15">
                  <motion.span initial={reduce ? false : { width: 0 }} animate={{ width: `${occupation}%` }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: reduce ? 0 : 0.1 }} className="block h-full rounded-full bg-primary" />
                </span>
                <span className="text-[12px] font-semibold tabular-nums text-text-secondary">{occupation}% ocupado</span>
              </div>
            )}
            {team.length >= 2 && (
              <div role="radiogroup" aria-label="Ver o dia de" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]">
                {[{ id: null, name: "Todos" }, ...team].map((m) => (
                  <button
                    key={m.id ?? "todos"}
                    type="button"
                    role="radio"
                    aria-checked={person === m.id}
                    onClick={() => setPerson(m.id)}
                    className={`h-9 shrink-0 rounded-full px-3 text-[13px] font-semibold transition-colors md:h-8 ${person === m.id ? "bg-primary text-white" : "bg-panel-2 text-text-secondary hover:bg-panel-hover hover:text-text-primary"}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
            {services.length > 0 && (
              <Button variant="secondary" icon={Plus} className="h-11 md:h-9" onClick={() => onNew(date)}>
                Nova reserva
              </Button>
            )}
          </header>

          <div className="flex flex-col gap-1 p-3">
            {blocked.map((b) => (
              <p key={b.id} className="mb-2 flex items-center gap-2 rounded-xl bg-warning/14 p-3 text-[13.5px] font-semibold text-warning-strong">
                <Lock size={15} className="shrink-0" /> Dia bloqueado{b.reason ? `: ${b.reason}` : ""}. Ninguém consegue reservar.
              </p>
            ))}

            {!services.length && (
              <div className="flex flex-col gap-2 rounded-2xl border border-border-ui/70 p-4">
                <p className="text-[15px] font-semibold text-text-primary">Comece pelos seus serviços</p>
                <p className="text-[14px] leading-snug text-text-secondary">Diga o que você atende e quanto tempo leva. O Nexo calcula os horários livres sozinho.</p>
                <Button className="mt-1 h-11 self-start md:h-9" onClick={onSetup}>
                  Cadastrar serviços
                </Button>
              </div>
            )}

            {loading &&
              [0, 1, 2].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-2.5 py-1.5" role={i === 0 ? "status" : undefined} aria-label={i === 0 ? "Carregando" : undefined}>
                  <span className="h-3 w-11 rounded bg-text-secondary/15" />
                  <span className="h-14 flex-1 rounded-2xl bg-text-secondary/10" />
                </div>
              ))}

            {!loading && services.length > 0 && !bookings?.length && blocked.length === 0 && closed && (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-text-secondary">
                <Calendar size={28} />
                <p className="text-[14.5px] font-semibold text-text-primary">Fechado neste dia</p>
                <p className="text-[13.5px]">Mude em Horários, se atender.</p>
              </div>
            )}

            {!loading && !(closed && !bookings?.length) && (
              <ol className="flex flex-col">
                {day.items.map((item, i) => (
                  <motion.li
                    key={item.kind === "booking" ? item.booking.id : `${item.kind}-${item.at}`}
                    initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30, delay: reduce ? 0 : Math.min(i, 10) * 0.045 }}
                    className="grid grid-cols-[46px_minmax(0,1fr)] gap-2"
                  >
                    {item.kind === "booking" && (
                      <>
                        <span className={`pt-[18px] text-right text-[13px] font-bold tabular-nums ${item.booking.status === "CANCELLED" ? "text-text-secondary/60 line-through" : "text-text-primary"}`}>{clock(item.at)}</span>
                        <div className="py-1">
                          <PersonRow booking={item.booking} timeZone={timeZone} open={activeId === item.booking.id} onToggle={() => onActive(activeId === item.booking.id ? null : item.booking.id)} onMove={onMove} onCancelled={onCancelled} />
                        </div>
                      </>
                    )}
                    {item.kind === "free" && (
                      <>
                        <span className="pt-2.5 text-right text-[12px] tabular-nums text-text-secondary/70">{clock(item.at)}</span>
                        <div className="py-1">
                          <button type="button" aria-label={`Marcar às ${clock(item.at)}`} onClick={() => onNew(date, clock(item.at))} className="group flex min-h-8 w-full items-center gap-1.5 rounded-xl border border-dashed border-border-ui/80 px-3 text-left text-[12.5px] text-text-secondary transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary-strong">
                            <Clock size={13} /> Livre até {clock(item.end)}
                            <Plus size={13} className="ml-auto opacity-60 group-hover:opacity-100" />
                          </button>
                        </div>
                      </>
                    )}
                    {item.kind === "now" && (
                      <>
                        <span className="text-right text-[11.5px] font-bold tabular-nums leading-5 text-danger">{clock(item.at)}</span>
                        <span className="flex h-5 items-center" aria-label="Agora">
                          <motion.span animate={reduce ? undefined : { scale: [1, 1.4, 1] }} transition={{ duration: 2.4, repeat: Infinity }} className="h-2 w-2 shrink-0 rounded-full bg-danger" />
                          <span className="h-px flex-1 bg-danger/70" />
                        </span>
                      </>
                    )}
                  </motion.li>
                ))}
              </ol>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
