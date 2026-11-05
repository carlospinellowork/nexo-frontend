import { apiErrorMessage } from "../../api/instance";
import { useBookingAction } from "../../api/mutations/useAgendaMutations";
import { useGetBookings } from "../../api/queries/useGetBookings";
import { Badge } from "../../shared/components/ui/Badge";
import { Button } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { inputClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Loader2, WhatsApp, X } from "../../shared/icons";
import { type AgendaData, type Booking, dayIn, longDay, shiftDay, timeIn, whatsappOfCustomer } from "./types";

const STATUS = {
  PENDING: <Badge tone="warning">Para confirmar</Badge>,
  CONFIRMED: <Badge tone="success">Confirmada</Badge>,
  CANCELLED: <Badge tone="neutral">Cancelada</Badge>,
};

function BookingCard({ booking, timeZone }: { booking: Booking; timeZone: string }) {
  const { mutateAsync, isPending, variables } = useBookingAction();
  const run = async (action: "confirm" | "cancel") => {
    if (action === "cancel" && !confirm(`Cancelar a reserva de ${booking.customerName}? O horário volta a ficar livre.`)) return;
    try {
      await mutateAsync({ id: booking.id, action });
      toast.success(action === "confirm" ? "Reserva confirmada." : "Reserva cancelada. Avise o cliente pelo WhatsApp.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível atualizar a reserva."));
    }
  };
  const cancelled = booking.status === "CANCELLED";
  return (
    <li className={`flex flex-col gap-2.5 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card ${cancelled ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="font-display text-[20px] font-bold tabular-nums text-text-primary">{timeIn(booking.startsAt, timeZone)}</span>
        <span className="text-[13px] tabular-nums text-text-secondary">até {timeIn(booking.endsAt, timeZone)}</span>
        <span className="ml-auto">{STATUS[booking.status]}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-semibold text-text-primary">{booking.customerName}</span>
        <span className="text-[14px] text-text-secondary">{booking.serviceName}</span>
        {booking.note && <span className="mt-1 whitespace-pre-wrap break-words text-[14px] text-text-secondary">{booking.note}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={whatsappOfCustomer(booking.customerPhone)} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-1.5 rounded-xl border border-border-ui px-3 text-[14px] font-semibold text-text-primary hover:bg-panel-hover">
          <WhatsApp size={16} /> WhatsApp
        </a>
        {booking.status === "PENDING" && (
          <Button icon={CheckCircle2} className="h-11" loading={isPending && variables?.action === "confirm"} onClick={() => void run("confirm")}>
            Confirmar
          </Button>
        )}
        {!cancelled && (
          <Button variant="ghost" icon={X} className="ml-auto h-11" loading={isPending && variables?.action === "cancel"} onClick={() => void run("cancel")}>
            Cancelar
          </Button>
        )}
      </div>
    </li>
  );
}

/** A lista do dia: é a tela que o dono abre para saber quem vem. */
export function DayView({ agenda, date, onDate, onSetup }: { agenda: AgendaData; date: string; onDate: (date: string) => void; onSetup: () => void }) {
  const { timeZone } = agenda.config;
  const { data: bookings, isLoading } = useGetBookings(date);
  const today = dayIn(timeZone);
  const blocked = agenda.blocks.filter((b) => dayIn(timeZone, new Date(b.startsAt)) <= date && date < dayIn(timeZone, new Date(b.endsAt)));
  const active = bookings?.filter((b) => b.status !== "CANCELLED") ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 rounded-2xl border border-border-ui/70 bg-panel p-1 shadow-card">
        <button type="button" aria-label="Dia anterior" onClick={() => onDate(shiftDay(date, -1))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-panel-hover">
          <ChevronLeft size={20} />
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold text-text-primary first-letter:uppercase">{date === today ? `Hoje, ${longDay(date).split(", ")[1]}` : longDay(date)}</span>
        <button type="button" aria-label="Próximo dia" onClick={() => onDate(shiftDay(date, 1))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-panel-hover">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input type="date" aria-label="Ir para o dia" className={`${inputClass} min-w-0 flex-1`} value={date} onChange={(e) => e.target.value && onDate(e.target.value)} />
        {date !== today && (
          <Button variant="outline" className="h-11 shrink-0" onClick={() => onDate(today)}>
            Hoje
          </Button>
        )}
      </div>

      {blocked.map((b) => (
        <p key={b.id} className="rounded-2xl bg-warning/14 p-3 text-[14px] font-semibold text-warning-strong">
          Dia bloqueado{b.reason ? `: ${b.reason}` : ""}. Ninguém consegue reservar.
        </p>
      ))}

      {!agenda.services.length && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border-ui/70 bg-panel p-4 shadow-card">
          <p className="text-[15px] font-semibold text-text-primary">Comece pelos seus serviços</p>
          <p className="text-[14px] leading-snug text-text-secondary">Diga o que você atende e quanto tempo leva. O Nexo calcula os horários livres sozinho.</p>
          <Button className="mt-1 h-11 self-start" onClick={onSetup}>
            Cadastrar serviços
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : bookings?.length ? (
        <>
          <p className="px-1 text-[13px] font-semibold text-text-secondary">{active.length === 1 ? "1 reserva" : `${active.length} reservas`}</p>
          <ul className="flex flex-col gap-2">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} timeZone={timeZone} />
            ))}
          </ul>
        </>
      ) : (
        agenda.services.length > 0 && <EmptyState icon={Calendar} title="Nenhuma reserva neste dia" description="As reservas aparecem aqui assim que alguém marcar." />
      )}
    </div>
  );
}
