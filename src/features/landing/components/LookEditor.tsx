import type { ReactNode } from "react";
import { RotateCcw } from "../../../shared/icons";
import { Backdrop } from "../look/Backdrop";
import { FONTS } from "../look/fonts";
import { patternImage } from "../look/pattern";
import { buttonClass, isHex, resolveLook } from "../look/resolve";
import { getTheme } from "../look/themes";
import { BG_PATTERNS, BUTTON_SHAPES, BUTTON_STYLES, FONT_IDS, type Background, type BgPattern, type ButtonShape, type ButtonStyle, type LandingLook } from "../look/types";

const BG_LABELS: Record<"solid" | "gradient" | "mesh" | "pattern", string> = { solid: "Cor", gradient: "Degradê", mesh: "Malha", pattern: "Textura" };
const PATTERN_LABELS: Record<BgPattern, string> = {
  dots: "Bolinhas",
  grid: "Quadriculado",
  diagonal: "Listras",
  checker: "Xadrez",
  waves: "Ondas",
  hearts: "Corações",
  stars: "Estrelas",
  sparkles: "Brilhos",
  strawberries: "Morangos",
  noise: "Grão",
};
const STYLE_LABELS: Record<ButtonStyle, string> = { filled: "Cheio", outline: "Contorno", soft: "Suave", glass: "Vidro", hard: "Sombra" };
const SHAPE_LABELS: Record<ButtonShape, string> = { pill: "Pílula", rounded: "Arredondado", square: "Quadrado" };

/** Quantas cores cada tipo de fundo usa. */
const COLOR_COUNT = { solid: 1, gradient: 2, mesh: 4, pattern: 2 } as const;

const hexOr = (c: string | undefined, fallback: string) => (isHex(c) ? c : fallback);

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-text-secondary">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      onClick={onClick}
      className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-colors ${
        active ? "border-primary bg-primary/10 text-primary-strong" : "border-border-ui bg-panel text-text-primary hover:bg-panel-hover"
      }`}
    >
      {children}
    </button>
  );
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border-ui shadow-sm" style={{ background: value }} title={label}>
      <span className="sr-only">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
    </label>
  );
}

interface LookEditorProps {
  theme: string;
  look?: LandingLook;
  fontHeading?: string;
  onChange: (look: LandingLook | undefined) => void;
}

/** "Personalizar": troca cada parte do tema (fundo, botões, cores e letra). Tudo grátis. */
export function LookEditor({ theme, look, fontHeading, onChange }: LookEditorProps) {
  const def = getTheme(theme);
  const r = resolveLook(def, look, fontHeading);
  const set = (patch: Partial<LandingLook>) => onChange({ ...look, ...patch });
  const bg = r.bg;
  const bgType = bg.type === "image" ? "solid" : bg.type;
  const fallback = [hexOr(bg.colors[0], "#0A0E1A"), hexOr(def.accent, "#7C5CFF"), hexOr(def.cta.bg, "#EC4899"), hexOr(def.button.bg, "#22D3EE")];

  const pickBgType = (type: keyof typeof COLOR_COUNT) => {
    const colors = Array.from({ length: COLOR_COUNT[type] }, (_, i) => hexOr(bg.colors[i], fallback[i]));
    const next: Background = { type, colors, ...(type === "pattern" ? { pattern: bg.pattern ?? "dots" } : {}), ...(type === "gradient" ? { angle: 160 } : {}) };
    set({ background: next });
  };
  const setColor = (i: number, c: string) => {
    const colors = Array.from({ length: COLOR_COUNT[bgType] }, (_, j) => hexOr(bg.colors[j], fallback[j]));
    colors[i] = c;
    set({ background: { ...bg, type: bgType, colors } });
  };
  const changed = Boolean(look && Object.values(look).some((v) => v !== undefined));

  return (
    <div className="flex flex-col gap-5">
      <Section title="Fundo">
        <div role="radiogroup" aria-label="Tipo de fundo" className="grid grid-cols-4 gap-1.5">
          {(Object.keys(BG_LABELS) as (keyof typeof BG_LABELS)[]).map((t) => (
            <Chip key={t} active={bgType === t} onClick={() => pickBgType(t)}>
              {BG_LABELS[t]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: COLOR_COUNT[bgType] }, (_, i) => (
            <ColorInput key={i} value={hexOr(bg.colors[i], fallback[i])} onChange={(c) => setColor(i, c)} label={bgType === "pattern" && i === 1 ? "Cor do desenho" : `Cor ${i + 1} do fundo`} />
          ))}
          <span className="text-[12.5px] text-text-secondary">{bgType === "pattern" ? "Fundo e desenho" : bgType === "mesh" ? "A primeira é a base; as outras flutuam" : "Toque para trocar"}</span>
        </div>
        {bgType === "pattern" && (
          <div role="radiogroup" aria-label="Desenho" className="grid grid-cols-5 gap-1.5">
            {BG_PATTERNS.map((p) => {
              const img = patternImage(p, hexOr(bg.colors[1], "#FFFFFF"));
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={bg.pattern === p}
                  aria-label={PATTERN_LABELS[p]}
                  title={PATTERN_LABELS[p]}
                  onClick={() => set({ background: { ...bg, type: "pattern", pattern: p } })}
                  className={`aspect-square rounded-xl border-2 ${bg.pattern === p ? "border-primary" : "border-transparent"}`}
                  style={{ backgroundColor: hexOr(bg.colors[0], "#111111"), backgroundImage: img.image, backgroundSize: `${img.size}px` }}
                />
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Botões">
        <div role="radiogroup" aria-label="Estilo dos botões" className="grid grid-cols-3 gap-1.5 min-[420px]:grid-cols-5">
          {BUTTON_STYLES.map((st) => (
            <button
              key={st}
              type="button"
              role="radio"
              aria-checked={r.buttonStyle === st}
              onClick={() => set({ buttonStyle: st })}
              className={`relative isolate flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border-2 p-2 ${r.buttonStyle === st ? "border-primary" : "border-border-ui"}`}
              style={r.vars}
            >
              <Backdrop bg={bg} animate={false} />
              <span className={`h-5 w-full ${buttonClass(st, r.buttonShape)} !shadow-none`} />
              <span className="rounded bg-black/45 px-1 text-[11.5px] font-semibold text-white">{STYLE_LABELS[st]}</span>
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Forma dos botões" className="grid grid-cols-3 gap-1.5">
          {BUTTON_SHAPES.map((sh) => (
            <Chip key={sh} active={r.buttonShape === sh} onClick={() => set({ buttonShape: sh })}>
              <span className={`h-3.5 w-6 border-2 border-current ${sh === "pill" ? "rounded-full" : sh === "rounded" ? "rounded-[5px]" : "rounded-[2px]"}`} />
              {SHAPE_LABELS[sh]}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ColorInput value={hexOr(look?.buttonColor, hexOr(def.button.bg, "#FFFFFF"))} onChange={(c) => set({ buttonColor: c })} label="Cor dos botões" />
          <span className="flex-1 text-[12.5px] text-text-secondary">Cor dos botões{look?.buttonColor ? "" : " (a do tema)"}</span>
          {look?.buttonColor && (
            <button type="button" onClick={() => set({ buttonColor: undefined })} className="h-9 rounded-lg px-2 text-[13px] font-semibold text-primary-strong hover:bg-primary/8">
              Usar a do tema
            </button>
          )}
        </div>
      </Section>

      <Section title="Cor do texto">
        <div className="flex items-center gap-2">
          <ColorInput value={hexOr(look?.textColor, hexOr(def.text, r.dark ? "#FFFFFF" : "#111111"))} onChange={(c) => set({ textColor: c })} label="Cor do texto" />
          <span className="flex-1 text-[12.5px] text-text-secondary">{look?.textColor ? "Escolhida por você" : "Automática, para ler bem no fundo"}</span>
          {look?.textColor && (
            <button type="button" onClick={() => set({ textColor: undefined })} className="h-9 rounded-lg px-2 text-[13px] font-semibold text-primary-strong hover:bg-primary/8">
              Automática
            </button>
          )}
        </div>
      </Section>

      <Section title="Letra dos títulos">
        <div role="radiogroup" aria-label="Letra dos títulos" className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-3">
          {FONT_IDS.map((f) => (
            <Chip key={f} active={r.font === f} onClick={() => set({ font: f })} label={FONTS[f].label}>
              <span style={{ fontFamily: FONTS[f].family }} className={`truncate ${f === "press-start" ? "text-[10px]" : "text-[15px]"}`}>
                {FONTS[f].label}
              </span>
            </Chip>
          ))}
        </div>
      </Section>

      {changed && (
        <button type="button" onClick={() => onChange(undefined)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border-ui text-[14px] font-semibold text-text-primary hover:bg-panel-hover">
          <RotateCcw size={16} /> Voltar ao tema &ldquo;{def.name}&rdquo; como ele é
        </button>
      )}
    </div>
  );
}
