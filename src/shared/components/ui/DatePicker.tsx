import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from "../../icons";
import { Popover } from "./Popover";
import { inputClass } from "./styles";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = () => new Date().toLocaleDateString("sv-SE");
const shortLabel = (date: string) => (date ? `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}` : "");
const monthName = (y: number, m: number) => new Date(Date.UTC(y, m, 15)).toLocaleDateString("pt-BR", { timeZone: "UTC", month: "long", year: "numeric" });

interface DatePickerProps {
  /** AAAA-MM-DD; vazio quando não há data. */
  value: string;
  onChange: (date: string) => void;
  id?: string;
  label?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Mostra o botão para limpar. */
  clearable?: boolean;
  className?: string;
}

/** Calendário do Nexo no lugar do campo de data do navegador. */
export function DatePicker({ value, onChange, id, label, min, max, placeholder = "Escolher dia", disabled, clearable, className = "" }: DatePickerProps) {
  const reduce = useReducedMotion();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const base = value || todayIso();
  const [cursor, setCursor] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1, dir: 0 });
  const close = useCallback(() => setOpen(false), []);

  const show = () => {
    const from = value || todayIso();
    setCursor({ y: Number(from.slice(0, 4)), m: Number(from.slice(5, 7)) - 1, dir: 0 });
    setOpen(true);
  };
  const go = (by: number) =>
    setCursor((c) => {
      const d = new Date(Date.UTC(c.y, c.m + by, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth(), dir: by };
    });

  const offset = new Date(Date.UTC(cursor.y, cursor.m, 1)).getUTCDay();
  const total = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const today = todayIso();
  const allowed = (date: string) => (!min || date >= min) && (!max || date <= max);

  return (
    <div className={`relative flex min-w-0 items-center ${className}`}>
      <button ref={trigger} id={id} type="button" aria-haspopup="dialog" aria-expanded={open} aria-label={label ? `${label}: ${shortLabel(value) || "sem data"}` : undefined} disabled={disabled} onClick={() => (open ? setOpen(false) : show())} className={`${inputClass} flex w-full items-center gap-2 text-left font-normal tabular-nums disabled:cursor-not-allowed disabled:opacity-60 ${open ? "border-primary ring-2 ring-primary/20" : ""}`}>
        <Calendar size={16} className="shrink-0 text-text-secondary" />
        <span className={`min-w-0 flex-1 truncate ${value ? "text-text-primary" : "text-text-secondary"}`}>{shortLabel(value) || placeholder}</span>
      </button>
      {clearable && value && !disabled && (
        <button type="button" aria-label="Limpar data" onClick={() => onChange("")} className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
          <X size={14} />
        </button>
      )}
      {open && (
        <Popover anchor={trigger} onClose={close} minWidth={288} role="dialog" label="Escolher dia">
          <div className="p-2">
            <div className="mb-1 flex items-center gap-1">
              <span className="flex-1 pl-1.5 text-[14px] font-bold text-text-primary first-letter:uppercase">{monthName(cursor.y, cursor.m)}</span>
              <button type="button" aria-label="Mês anterior" onClick={() => go(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
                <ChevronLeft size={18} />
              </button>
              <button type="button" aria-label="Próximo mês" onClick={() => go(1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11.5px] font-semibold text-text-secondary">
              {WEEK.map((d, i) => (
                <span key={i} className="py-1">
                  {d}
                </span>
              ))}
            </div>
            <motion.div key={`${cursor.y}-${cursor.m}`} initial={reduce || !cursor.dir ? false : { opacity: 0, x: cursor.dir * 16 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 480, damping: 34 }} className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: offset }, (_, i) => (
                <span key={`e${i}`} />
              ))}
              {Array.from({ length: total }, (_, i) => {
                const date = iso(cursor.y, cursor.m, i + 1);
                const isSelected = date === value;
                return (
                  <button
                    key={date}
                    type="button"
                    aria-label={shortLabel(date)}
                    aria-pressed={isSelected}
                    disabled={!allowed(date)}
                    onClick={() => {
                      onChange(date);
                      setOpen(false);
                      trigger.current?.focus();
                    }}
                    className={`flex h-10 items-center justify-center rounded-lg text-[13.5px] font-medium tabular-nums transition-colors disabled:opacity-25 ${isSelected ? "bg-primary font-bold text-white" : date === today ? "text-primary-strong ring-1 ring-primary/40 hover:bg-primary/10" : "text-text-primary hover:bg-primary/10"}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </motion.div>
            {allowed(today) && (
              <button
                type="button"
                onClick={() => {
                  onChange(today);
                  setOpen(false);
                  trigger.current?.focus();
                }}
                className="mt-1 h-9 w-full rounded-lg text-[13px] font-semibold text-primary-strong hover:bg-primary/10"
              >
                Hoje
              </button>
            )}
          </div>
        </Popover>
      )}
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const FIVE_MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

function Column({ items, selected, label, onPick }: { items: string[]; selected: string; label: string; onPick: (v: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <div ref={box} role="listbox" aria-label={label} className="flex h-52 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain">
      {items.map((v) => (
        <button key={v} type="button" role="option" aria-selected={v === selected} onClick={() => onPick(v)} className={`min-h-9 shrink-0 rounded-lg text-[14px] font-semibold tabular-nums transition-colors ${v === selected ? "bg-primary text-white" : "text-text-primary hover:bg-primary/10"}`}>
          {v}
        </button>
      ))}
    </div>
  );
}

/** Hora do Nexo: duas colunas para tocar. Escolher os minutos fecha. */
export function TimePicker({ value, onChange, id, label, disabled, className = "" }: { value: string; onChange: (time: string) => void; id?: string; label?: string; disabled?: boolean; className?: string }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const hour = value.slice(0, 2) || "09";
  const minute = value.slice(3, 5) || "00";
  const minutes = FIVE_MINUTES.includes(minute) ? FIVE_MINUTES : [...FIVE_MINUTES, minute].sort();

  return (
    <div className={`min-w-0 ${className}`}>
      <button ref={trigger} id={id} type="button" aria-haspopup="dialog" aria-expanded={open} aria-label={label ? `${label}: ${value}` : undefined} disabled={disabled} onClick={() => setOpen(!open)} className={`${inputClass} flex w-full items-center gap-2 text-left font-normal tabular-nums text-text-primary disabled:cursor-not-allowed disabled:opacity-60 ${open ? "border-primary ring-2 ring-primary/20" : ""}`}>
        <Clock size={16} className="shrink-0 text-text-secondary" />
        <span className="min-w-0 flex-1 truncate">{value || "--:--"}</span>
      </button>
      {open && (
        <Popover anchor={trigger} onClose={close} minWidth={170} role="dialog" label="Escolher horário">
          <div className="flex gap-1 p-1">
            <Column items={HOURS} selected={hour} label="Hora" onPick={(h) => onChange(`${h}:${minute}`)} />
            <Column
              items={minutes}
              selected={minute}
              label="Minutos"
              onPick={(m) => {
                onChange(`${hour}:${m}`);
                setOpen(false);
                trigger.current?.focus();
              }}
            />
          </div>
        </Popover>
      )}
    </div>
  );
}

/** Dia e hora juntos, no formato AAAA-MM-DDTHH:MM. Vazio quando não há data. */
export function DateTimePicker({ value, onChange, id, label }: { value: string; onChange: (value: string) => void; id?: string; label?: string }) {
  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-1.5">
      <DatePicker id={id} label={label} value={date} clearable placeholder="Sem data" onChange={(d) => onChange(d ? `${d}T${time || "09:00"}` : "")} />
      <TimePicker label={label ? `${label}, horário` : undefined} value={time} disabled={!date} onChange={(t) => onChange(`${date}T${t}`)} />
    </div>
  );
}
