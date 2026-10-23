import { Check } from "lucide-react";
import { LANDING_THEMES, type LandingTheme, THEME_INFO } from "../contract";

/** Escolha do tema da página com amostras das cores. */
export function ThemePicker({ value, onChange, columns = 2 }: { value: LandingTheme; onChange: (theme: LandingTheme) => void; columns?: 1 | 2 }) {
  return (
    <div role="radiogroup" aria-label="Tema da página" className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {LANDING_THEMES.map((id) => {
        const info = THEME_INFO[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${
              active ? "border-primary bg-primary/8 ring-4 ring-primary/12" : "border-border-ui bg-panel-2 hover:bg-panel-hover"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-black/10" aria-hidden>
              {info.colors.map((c) => (
                <span key={c} className="h-full flex-1" style={{ background: c }} />
              ))}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14px] font-semibold text-text-primary">{info.name}</span>
              <span className="truncate text-[12px] text-text-secondary">{info.description}</span>
            </span>
            {active && <Check size={16} className="shrink-0 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
