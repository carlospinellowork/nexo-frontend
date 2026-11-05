import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useCreateAgendaBlock, useDeleteAgendaBlock, useUpdateAgenda } from "../../api/mutations/useAgendaMutations";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass, selectClass } from "../../shared/components/ui/styles";
import { Switch } from "../../shared/components/ui/Switch";
import { toast } from "../../shared/components/ui/toast-store";
import { Plus, Save, Trash2, X } from "../../shared/icons";
import { type AgendaData, dayIn, shiftDay, shortDay, type WorkingInterval } from "./types";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const STEPS = [
  { value: 15, label: "A cada 15 minutos" },
  { value: 30, label: "A cada 30 minutos" },
  { value: 60, label: "A cada 1 hora" },
];
const NOTICES = [
  { value: 0, label: "Sem antecedência" },
  { value: 60, label: "1 hora antes" },
  { value: 120, label: "2 horas antes" },
  { value: 1440, label: "1 dia antes" },
  { value: 2880, label: "2 dias antes" },
];

/** Divide o período em dois, com uma pausa: das 12h às 13h se couber; senão, 30 minutos no meio. */
function withBreak(interval: WorkingInterval): WorkingInterval[] {
  const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const start = minutes(interval.start);
  const end = minutes(interval.end);
  const lunch = start < 720 && end > 780;
  const pauseStart = lunch ? 720 : Math.floor((start + end) / 60) * 30;
  const pauseEnd = lunch ? 780 : pauseStart + 30;
  if (pauseStart <= start || pauseEnd >= end) return [interval];
  return [
    { ...interval, end: clock(pauseStart) },
    { ...interval, start: clock(pauseEnd) },
  ];
}

function BlockSheet({ today, onClose }: { today: string; onClose: () => void }) {
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [reason, setReason] = useState("");
  const { mutateAsync, isPending } = useCreateAgendaBlock();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { conflicts } = await mutateAsync({ from, to: to < from ? from : to, reason: reason.trim() || undefined });
      if (conflicts) toast.error(conflicts === 1 ? "Bloqueado, mas já existe 1 reserva nesse período. Veja na lista do dia." : `Bloqueado, mas já existem ${conflicts} reservas nesse período. Veja na lista do dia.`);
      else toast.success("Período bloqueado.");
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível bloquear."));
    }
  };
  return (
    <Sheet
      open
      title="Bloquear dias"
      onClose={onClose}
      busy={isPending}
      onSubmit={(e) => void submit(e)}
      footer={
        <Button type="submit" size="lg" className="w-full" loading={isPending}>
          Bloquear
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-text-secondary">
            De
            <input type="date" className={inputClass} min={today} value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-text-secondary">
            Até
            <input type="date" className={inputClass} min={from} value={to < from ? from : to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-text-secondary">
          Motivo (só você vê)
          <input className={`${inputClass} text-[16px] md:text-[14px]`} maxLength={80} value={reason} placeholder="Ex.: Feriado, férias" onChange={(e) => setReason(e.target.value)} />
        </label>
      </div>
    </Sheet>
  );
}

/** Horário de atendimento, regras da reserva e bloqueios. */
export function HoursView({ agenda, canEdit }: { agenda: AgendaData; canEdit: boolean }) {
  const { config, blocks } = agenda;
  const [hours, setHours] = useState<WorkingInterval[]>(config.hours);
  const [dirty, setDirty] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const { mutateAsync: update, isPending } = useUpdateAgenda();
  const { mutateAsync: removeBlock } = useDeleteAgendaBlock();

  const edit = (next: WorkingInterval[]) => {
    setHours(next);
    setDirty(true);
  };
  const saveHours = async () => {
    try {
      await update({ hours });
      setDirty(false);
      toast.success("Horário salvo.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Confira os horários: o fim precisa ser depois do início, sem sobrepor."));
    }
  };
  const setRule = (patch: Parameters<typeof update>[0]) => update(patch).catch((err: unknown) => toast.error(apiErrorMessage(err, "Não foi possível salvar.")));
  const today = dayIn(config.timeZone);

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
      <section className="flex flex-col gap-2 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card lg:p-4">
        <h2 className="text-[16px] font-bold tracking-tight text-text-primary">Horário de atendimento</h2>
        {ORDER.map((day) => {
          const intervals = hours.filter((h) => h.day === day);
          return (
            <div key={day} className="flex flex-col gap-1.5 border-t border-border-ui/60 py-2 first-of-type:border-0">
              <div className="flex min-h-9 items-center gap-2">
                <span className="flex-1 text-[14px] font-semibold text-text-primary">{DAYS[day]}</span>
                {!intervals.length && <span className="text-[13px] text-text-secondary">Fechado</span>}
                {canEdit && <Switch checked={intervals.length > 0} label={`Atender ${DAYS[day]}`} onChange={(on) => edit(on ? [...hours, { day, start: "09:00", end: "18:00" }] : hours.filter((h) => h.day !== day))} />}
              </div>
              {intervals.map((interval, i) => {
                const change = (patch: Partial<WorkingInterval>) => edit(hours.map((h) => (h === interval ? { ...h, ...patch } : h)));
                return (
                  <div key={`${day}-${i}`} className="flex items-center gap-1.5">
                    <input type="time" aria-label={`${DAYS[day]}: início`} disabled={!canEdit} className={`${inputClass} min-w-0 flex-1`} value={interval.start} onChange={(e) => e.target.value && change({ start: e.target.value })} />
                    <span className="text-[13px] text-text-secondary">até</span>
                    <input type="time" aria-label={`${DAYS[day]}: fim`} disabled={!canEdit} className={`${inputClass} min-w-0 flex-1`} value={interval.end === "24:00" ? "23:59" : interval.end} onChange={(e) => e.target.value && change({ end: e.target.value })} />
                    {canEdit && intervals.length > 1 && (
                      <button type="button" aria-label="Remover este horário" onClick={() => edit(hours.filter((h) => h !== interval))} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/12 hover:text-danger">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
              {canEdit && intervals.length === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const first = intervals[0];
                    edit([...hours.filter((h) => h !== first), ...withBreak(first)]);
                  }}
                  className="flex min-h-9 items-center gap-1 self-start text-[13px] font-semibold text-primary-strong"
                >
                  <Plus size={13} /> Adicionar pausa
                </button>
              )}
            </div>
          );
        })}
        {canEdit && (
          <Button icon={Save} className="h-11" onClick={() => void saveHours()} loading={isPending} disabled={!dirty}>
            Salvar horário
          </Button>
        )}
      </section>

      <div className="flex flex-col gap-4 lg:sticky lg:top-0">
      <section className="flex flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card lg:p-4">
        <h2 className="text-[16px] font-bold tracking-tight text-text-primary">Regras da reserva</h2>
        <div className="flex items-start gap-3">
          <span className="flex flex-1 flex-col">
            <span className="text-[14px] font-semibold text-text-primary">Aceitar direto</span>
            <span className="text-[13px] leading-snug text-text-secondary">{config.autoConfirm ? "A reserva entra confirmada e o cliente recebe a certeza na hora." : "Cada reserva espera você confirmar. O horário fica guardado enquanto isso."}</span>
          </span>
          {canEdit && <Switch checked={config.autoConfirm} label="Aceitar reservas direto" onChange={(autoConfirm) => void setRule({ autoConfirm })} />}
        </div>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-text-secondary">
          Oferecer horários
          <select className={selectClass} disabled={!canEdit} value={config.stepMinutes} onChange={(e) => void setRule({ stepMinutes: Number(e.target.value) })}>
            {[...STEPS, ...(STEPS.some((s) => s.value === config.stepMinutes) ? [] : [{ value: config.stepMinutes, label: `A cada ${config.stepMinutes} minutos` }])].map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-text-secondary">
          Reservar com antecedência de
          <select className={selectClass} disabled={!canEdit} value={config.minNoticeMinutes} onChange={(e) => void setRule({ minNoticeMinutes: Number(e.target.value) })}>
            {[...NOTICES, ...(NOTICES.some((n) => n.value === config.minNoticeMinutes) ? [] : [{ value: config.minNoticeMinutes, label: `${config.minNoticeMinutes} minutos antes` }])].map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card">
        <h2 className="text-[16px] font-bold tracking-tight text-text-primary">Dias bloqueados</h2>
        {!blocks.length && <p className="text-[14px] text-text-secondary">Nenhum. Use para feriados e férias.</p>}
        <ul className="flex flex-col gap-1.5">
          {blocks.map((b) => {
            const first = dayIn(config.timeZone, new Date(b.startsAt));
            const last = shiftDay(dayIn(config.timeZone, new Date(b.endsAt)), -1);
            return (
              <li key={b.id} className="flex items-center gap-2 rounded-xl bg-panel-2 px-3 py-1.5">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[14px] font-semibold tabular-nums text-text-primary">{first === last ? shortDay(first) : `${shortDay(first)} a ${shortDay(last)}`}</span>
                  {b.reason && <span className="truncate text-[13px] text-text-secondary">{b.reason}</span>}
                </span>
                {canEdit && (
                  <button type="button" aria-label="Remover bloqueio" onClick={() => void removeBlock(b.id).catch((err: unknown) => toast.error(apiErrorMessage(err, "Não foi possível remover.")))} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/12 hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {canEdit && (
          <Button variant="secondary" icon={Plus} className="h-11" onClick={() => setBlocking(true)}>
            Bloquear dias
          </Button>
        )}
      </section>
      </div>
      {blocking && <BlockSheet today={today} onClose={() => setBlocking(false)} />}
    </div>
  );
}
