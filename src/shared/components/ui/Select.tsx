import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "../../icons";
import { Popover } from "./Popover";
import { inputClass } from "./styles";

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
  /** Linha menor abaixo do rótulo. */
  hint?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectProps<T extends string | number> {
  value: T | null | undefined;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  id?: string;
  /** Para quem não está dentro de um <label>. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Sem a moldura de campo: quem chama desenha a sua. */
  bare?: boolean;
}

/** O seletor do Nexo: no tema do painel, com teclado (setas, Enter, Esc e digitar para procurar). */
export function Select<T extends string | number>({ value, onChange, options, id, label, placeholder = "Selecione", disabled, className = "", bare }: SelectProps<T>) {
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const typed = useRef({ text: "", at: 0 });
  const selected = options.find((o) => o.value === value);
  const close = useCallback(() => setOpen(false), []);

  const show = () => {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  };

  const move = (dir: 1 | -1) => {
    let next = active;
    for (let i = 0; i < options.length; i++) {
      next = (next + dir + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setActive(next);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === "ArrowDown") move(1);
    else if (e.key === "ArrowUp") move(-1);
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(options.length - 1);
    else if (e.key === "Enter" || e.key === " ") {
      if (options[active]) pick(options[active]);
    } else if (e.key === "Tab") return setOpen(false);
    else if (e.key.length === 1) {
      const now = Date.now();
      typed.current = { text: now - typed.current.at < 700 ? typed.current.text + e.key.toLowerCase() : e.key.toLowerCase(), at: now };
      const found = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
      if (found >= 0) setActive(found);
    } else return;
    e.preventDefault();
  };

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={label}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        className={`${bare ? "" : inputClass} flex cursor-pointer items-center justify-between gap-2 text-left font-normal text-text-primary disabled:cursor-not-allowed disabled:opacity-60 ${open && !bare ? "border-primary ring-2 ring-primary/20" : ""} ${className}`}
      >
        <span className={`flex min-w-0 flex-1 items-center gap-2 truncate ${selected ? "" : "text-text-secondary"}`}>
          {selected?.icon}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-text-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <Popover anchor={trigger} onClose={close} minWidth={190}>
          <div ref={list} id={listId} role="listbox" aria-label={label} className="flex flex-col gap-0.5">
            {options.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <button
                  key={String(o.value)}
                  id={`${listId}-${i}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-index={i}
                  disabled={o.disabled}
                  tabIndex={-1}
                  onClick={() => pick(o)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[14px] transition-colors md:min-h-9 ${isSelected ? "font-semibold text-primary-strong" : "text-text-primary"} ${i === active ? "bg-primary/10" : ""} disabled:opacity-40`}
                >
                  {o.icon}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{o.label}</span>
                    {o.hint && <span className="truncate text-[12px] font-normal text-text-secondary">{o.hint}</span>}
                  </span>
                  {isSelected && <Check size={15} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </Popover>
      )}
    </>
  );
}
