import { isAxiosError } from "axios";
import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useCreateBooking, useRescheduleBooking } from "../../api/mutations/useAgendaMutations";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { DatePicker, TimePicker } from "../../shared/components/ui/DatePicker";
import { Select } from "../../shared/components/ui/Select";
import { inputClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { type AgendaData, type Booking, dayIn, durationLabel, money, timeIn } from "./types";

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
  const { mutateAsync, isPending } = useCreateBooking();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ serviceId, date: day, time: hour, customerName: name.trim(), customerPhone: phone.trim() || undefined, note: note.trim() || undefined });
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
export function MoveBookingSheet({ booking, timeZone, onClose }: { booking: Booking; timeZone: string; onClose: () => void }) {
  const [day, setDay] = useState(dayIn(timeZone, new Date(booking.startsAt)));
  const [hour, setHour] = useState(timeIn(booking.startsAt, timeZone));
  const { mutateAsync, isPending } = useRescheduleBooking();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ id: booking.id, date: day, time: hour });
      toast.success(`${booking.customerName} remarcado. Avise pelo WhatsApp.`);
      onClose();
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
