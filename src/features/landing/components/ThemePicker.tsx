import { useEffect, useState } from "react";
import { Check } from "../../../shared/icons";
import { Backdrop } from "../look/Backdrop";
import { FONTS, loadFont } from "../look/fonts";
import { buttonClass, resolveLook } from "../look/resolve";
import { THEMES } from "../look/themes";
import { CATEGORY_LABELS, THEME_CATEGORIES, type FontId, type ThemeCategory, type ThemeDef } from "../look/types";

/** Miniatura de um tema: o fundo, a foto, o nome na letra do tema e três botões no estilo dele. */
export function ThemeThumb({ theme, flat = false }: { theme: ThemeDef; flat?: boolean }) {
  const look = resolveLook(theme);
  const bg = flat ? { type: "solid" as const, colors: [theme.bg.colors[0]] } : look.bg;
  return (
    <span className="relative isolate flex aspect-[4/5] w-full flex-col items-center gap-1.5 overflow-hidden rounded-[14px] px-3 pt-4" style={look.vars} aria-hidden>
      <Backdrop bg={bg} animate={false} />
      <span className="h-7 w-7 shrink-0 rounded-full [background:var(--t-cta)]" />
      <span className="max-w-full truncate text-[13px] font-bold leading-tight text-[var(--t-text)]" style={{ fontFamily: FONTS[theme.font].family }}>
        {theme.name}
      </span>
      {[true, false, false].map((primary, i) => (
        <span key={i} className={`h-[15px] w-full shrink-0 ${buttonClass(theme.button.style, theme.button.shape, primary)} !shadow-none ${theme.button.style === "hard" ? "!border-[1.5px]" : ""}`} />
      ))}
    </span>
  );
}

interface ThemePickerProps {
  value: string;
  onChange: (theme: string) => void;
  /** Landing page completa: as miniaturas mostram só a cor de fundo (a página não usa texturas). */
  flat?: boolean;
}

/** Galeria de temas, com filtro por categoria. As letras dos temas são baixadas quando a galeria aparece. */
export function ThemePicker({ value, onChange, flat = false }: ThemePickerProps) {
  const [category, setCategory] = useState<ThemeCategory | "todos">("todos");
  useEffect(() => (Object.keys(FONTS) as FontId[]).forEach(loadFont), []);
  const list = category === "todos" ? THEMES : THEMES.filter((t) => t.category === category);

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Categorias de tema" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {(["todos", ...THEME_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`h-8 shrink-0 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
              category === c ? "border-primary bg-primary text-white" : "border-border-ui bg-panel text-text-secondary hover:bg-panel-hover"
            }`}
          >
            {c === "todos" ? `Todos (${THEMES.length})` : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label="Tema" className="grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-3">
        {list.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${t.name}: ${t.description}`}
              onClick={() => onChange(t.id)}
              className={`group flex flex-col gap-1.5 rounded-[18px] border p-1.5 text-left transition-[border-color,box-shadow] ${
                active ? "border-primary ring-4 ring-primary/15" : "border-border-ui hover:border-primary/40"
              }`}
            >
              <span className="transition-transform group-hover:scale-[1.02]">
                <ThemeThumb theme={t} flat={flat} />
              </span>
              <span className="flex items-center gap-1 px-1 pb-0.5">
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text-primary">{t.name}</span>
                {active && <Check size={15} className="shrink-0 text-primary" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
