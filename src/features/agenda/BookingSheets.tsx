import { isAxiosError } from "axios";
import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useCreateBooking, useRescheduleBooking } from "../../api/mutations/useAgendaMutations";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { DatePicker, TimePicker } from "../../shared/components/ui/DatePicker";
import { Select } from "../../shared/components/ui/Select";
import { inputClass, textareaClass } from "../../shared/components/ui/styles";
import { WhatsApp } from "../../shared/icons";
import { toast } from "../../shared/components/ui/toast-store";
import { type AgendaData, type Booking, dayIn, durationLabel, money, timeIn, whatsappOfCustomer } from "./types";

const field = "flex flex-col gap-1 text-[13px] font-semibold text-text-secondary";
const text = `${inputClass} text-[16px] font-normal text-text-primary md:text-[14px]`;

const failure = (err: unknown, fallback: string) => (isAxiosError(err) && err.response?.status === 409 ? "Esse horário já está ocupado. Escolha outro." : apiErrorMessage(err, fallback));

/** Marcar à mão: para quem ligou ou chegou na hora. Pode ser fora do horário de atendimento, nunca sobre outra reserva. */
export function NewBookingSheet({ agenda, date, time, onClose }: { agenda: AgendaData; date: string; time?: string; onClose: () => void }) {
  const services = agenda.services.filter((s) => s.active);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [day, setDay] = useState(date);
  const [hour, setHour] = useState(time ?? "09:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  // Com equipe: quem faz o serviço escolhido (sem serviços marcados, a pessoa faz todos).
  const team = agenda.staff.filter((m) => m.active && (!m.serviceIds.length || m.serviceIds.includes(serviceId)));
  const [staffId, setStaffId] = useState("");
  const chosenStaff = team.some((m) => m.id === staffId) ? staffId : (team[0]?.id ?? "");
  const { mutateAsync, isPending } = useCreateBooking();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ serviceId, date: day, time: hour, customerName: name.trim(), customerPhone: phone.trim() || undefined, note: note.trim() || undefined, ...(chosenStaff ? { staffId: chosenStaff } : {}) });
      toast.success("Reserva marcada.");
      onClose();
    } catch (err) {
      toast.error(failure(err, "Não foi possível marcar."));
    }
  };

  return (
    <Sheet
      open
      title="Nova reserva"
      onClose={onClose}
      busy={isPending}
      onSubmit={(e) => void submit(e)}
      footer={
        <Button type="submit" size="lg" className="w-full" loading={isPending} disabled={!name.trim() || !serviceId}>
          Marcar
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <label className={field}>
          Serviço
          <Select value={serviceId} onChange={setServiceId} options={services.map((sv) => ({ value: sv.id, label: sv.name, hint: [durationLabel(sv.durationMinutes), sv.priceCents != null ? money(sv.priceCents) : ""].filter(Boolean).join(" · ") }))} />
        </label>
        {team.length > 0 && (
          <label className={field}>
            Com quem
            <Select value={chosenStaff} onChange={setStaffId} options={team.map((m) => ({ value: m.id, label: m.name }))} />
          </label>
        )}
        <div className="grid grid-cols-2 gap-2">
          <label className={field}>
            Dia
            <DatePicker value={day} onChange={setDay} />
          </label>
          <label className={field}>
            Horário
            <TimePicker value={hour} onChange={setHour} />
          </label>
        </div>
        <label className={field}>
          Nome do cliente
          <input autoFocus className={text} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={field}>
          WhatsApp (opcional)
          <input inputMode="tel" className={text} maxLength={20} value={phone} placeholder="11 91234-5678" onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className={field}>
          Observação (opcional)
          <input className={text} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
    </Sheet>
  );
}

/** Remarcar sem arrastar: é o caminho no celular e no teclado. */
export function MoveBookingSheet({ booking, timeZone, onClose, onMoved }: { booking: Booking; timeZone: string; onClose: () => void; onMoved: (b: Booking) => void }) {
  const [day, setDay] = useState(dayIn(timeZone, new Date(booking.startsAt)));
  const [hour, setHour] = useState(timeIn(booking.startsAt, timeZone));
  const { mutateAsync, isPending } = useRescheduleBooking();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const moved = await mutateAsync({ id: booking.id, date: day, time: hour });
      toast.success(`${booking.customerName} remarcado.`);
      onClose();
      onMoved(moved);
    } catch (err) {
      toast.error(failure(err, "Não foi possível remarcar."));
    }
  };

  return (
    <Sheet
      open
      title={`Remarcar ${booking.customerName}`}
      onClose={onClose}
      busy={isPending}
      onSubmit={(e) => void submit(e)}
      footer={
        <Button type="submit" size="lg" className="w-full" loading={isPending}>
          Remarcar
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <label className={field}>
          Dia
          <DatePicker value={day} onChange={setDay} />
        </label>
        <label className={field}>
          Horário
          <TimePicker value={hour} onChange={setHour} />
        </label>
      </div>
    </Sheet>
  );
}

export interface CustomerNotice {
  booking: Booking;
  kind: "moved" | "cancelled";
}

function noticeText({ booking, kind }: CustomerNotice, timeZone: string) {
  const day = new Date(booking.startsAt).toLocaleDateString("pt-BR", { timeZone, weekday: "long", day: "2-digit", month: "2-digit" });
  const time = timeIn(booking.startsAt, timeZone);
  return kind === "moved" ? `Oi, ${booking.customerName}! Seu horário de ${booking.serviceName} foi remarcado para ${day}, às ${time}. Se não puder, é só me avisar.` : `Oi, ${booking.customerName}! Precisei cancelar o seu horário de ${booking.serviceName} de ${day}, às ${time}. Quer marcar outro?`;
}

/** O cliente não recebe nada sozinho: depois de remarcar ou cancelar, o dono manda com um toque, já escrito. */
export function NotifyCustomerSheet({ notice, timeZone, onClose }: { notice: CustomerNotice; timeZone: string; onClose: () => void }) {
  const [message, setMessage] = useState(() => noticeText(notice, timeZone));
  return (
    <Sheet
      open
      title={notice.kind === "moved" ? "Remarcado. Avisar o cliente?" : "Cancelado. Avisar o cliente?"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" className="h-11 md:h-9" onClick={onClose}>
            Agora não
          </Button>
          <a href={`${whatsappOfCustomer(notice.booking.customerPhone)}?text=${encodeURIComponent(message.trim())}`} target="_blank" rel="noopener noreferrer" onClick={onClose} className="nx-btn-primary inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-white md:h-9">
            <WhatsApp size={16} /> Abrir o WhatsApp
          </a>
        </>
      }
    >
      <textarea aria-label="Mensagem" className={`${textareaClass} min-h-28 text-[16px] md:text-[14px]`} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
      <p className="text-[13px] leading-snug text-text-secondary">Abre a conversa com {notice.booking.customerName} com este texto pronto. É você quem envia.</p>
    </Sheet>
  );
}
