import { Switch } from "../../shared/components/ui/Switch";
import { TimePicker } from "../../shared/components/ui/DatePicker";
import { Plus, X } from "../../shared/icons";
import type { WorkingInterval } from "./types";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

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

/** Os dias da semana com os horários de cada um (agenda do negócio ou de uma pessoa da equipe). */
export function WeekHoursEditor({ hours, onChange, disabled = false }: { hours: WorkingInterval[]; onChange: (next: WorkingInterval[]) => void; disabled?: boolean }) {
  return (
    <>
        {ORDER.map((day) => {
          const intervals = hours.filter((h) => h.day === day);
          return (
            <div key={day} className="flex flex-col gap-1.5 border-t border-border-ui/60 py-2 first-of-type:border-0">
              <div className="flex min-h-9 items-center gap-2">
                <span className="flex-1 text-[14px] font-semibold text-text-primary">{DAYS[day]}</span>
                {!intervals.length && <span className="text-[13px] text-text-secondary">Fechado</span>}
                {!disabled && <Switch checked={intervals.length > 0} label={`Atender ${DAYS[day]}`} onChange={(on) => onChange(on ? [...hours, { day, start: "09:00", end: "18:00" }] : hours.filter((h) => h.day !== day))} />}
              </div>
              {intervals.map((interval, i) => {
                const change = (patch: Partial<WorkingInterval>) => onChange(hours.map((h) => (h === interval ? { ...h, ...patch } : h)));
                return (
                  <div key={`${day}-${i}`} className="flex items-center gap-1.5">
                    <TimePicker label={`${DAYS[day]}: início`} disabled={disabled} className="flex-1" value={interval.start} onChange={(start) => change({ start })} />
                    <span className="text-[13px] text-text-secondary">até</span>
                    <TimePicker label={`${DAYS[day]}: fim`} disabled={disabled} className="flex-1" value={interval.end === "24:00" ? "23:59" : interval.end} onChange={(end) => change({ end })} />
                    {!disabled && intervals.length > 1 && (
                      <button type="button" aria-label="Remover este horário" onClick={() => onChange(hours.filter((h) => h !== interval))} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/12 hover:text-danger">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
              {!disabled && intervals.length === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const first = intervals[0];
                    onChange([...hours.filter((h) => h !== first), ...withBreak(first)]);
                  }}
                  className="flex min-h-9 items-center gap-1 self-start text-[13px] font-semibold text-primary-strong"
                >
                  <Plus size={13} /> Adicionar pausa
                </button>
              )}
            </div>
          );
        })}
    </>
  );
}
