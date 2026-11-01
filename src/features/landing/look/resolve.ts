import type { CSSProperties } from "react";
import { FONTS } from "./fonts";
import { BG_PATTERNS, BG_TYPES, BUTTON_SHAPES, BUTTON_STYLES, FONT_IDS, type Background, type ButtonShape, type ButtonStyle, type FontId, type LandingLook, type ThemeDef } from "./types";

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHex = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

/** Luminância (0 a 1) de uma cor #RRGGBB. */
export function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Fundo escuro? (média das cores; só considera as #RRGGBB). */
export function bgIsDark(bg: Background) {
  const hexes = bg.colors.filter(isHex);
  const list = bg.type === "pattern" || bg.type === "image" ? hexes.slice(0, 1) : hexes;
  if (!list.length) return true;
  return list.reduce((sum, c) => sum + luminance(c), 0) / list.length < 0.45;
}

/** Cor de texto legível por cima de uma cor. */
export const contrastText = (hex: string) => (luminance(hex) > 0.55 ? "#111111" : "#FFFFFF");

/**
 * O fundo que o dono escolheu passa por aqui antes de virar CSS: só cores #RRGGBB, tipos e desenhos conhecidos e
 * imagem https (ou data: de imagem). O que vier diferente é ignorado (a página nunca quebra nem injeta CSS).
 */
export function cleanBackground(bg: unknown): Background | undefined {
  if (!bg || typeof bg !== "object") return undefined;
  const b = bg as Partial<Background>;
  if (!BG_TYPES.includes(b.type as Background["type"])) return undefined;
  const colors = (Array.isArray(b.colors) ? b.colors : []).filter(isHex).slice(0, 4);
  if (!colors.length) return undefined;
  const out: Background = { type: b.type as Background["type"], colors };
  if (typeof b.angle === "number" && b.angle >= 0 && b.angle <= 360) out.angle = Math.round(b.angle);
  if (b.type === "pattern") out.pattern = BG_PATTERNS.includes(b.pattern as never) ? b.pattern : "dots";
  if (b.type === "image") {
    const url = typeof b.imageUrl === "string" ? b.imageUrl : "";
    if (!/^https:\/\/[^\s"'()\\]+$/.test(url) && !/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) return { type: "solid", colors };
    out.imageUrl = url;
  }
  return out;
}

export interface ResolvedLook {
  theme: ThemeDef;
  bg: Background;
  dark: boolean;
  font: FontId;
  buttonStyle: ButtonStyle;
  buttonShape: ButtonShape;
  /** Variáveis CSS (--t-*) para o elemento raiz da página. */
  vars: CSSProperties;
}

/** Junta o tema com o que o dono mudou. `fontHeading` é a escolha antiga ("Clássica" = serif). */
export function resolveLook(theme: ThemeDef, look?: LandingLook | null, fontHeading?: string): ResolvedLook {
  const custom = look ?? {};
  const bg = cleanBackground(custom.background) ?? theme.bg;
  const dark = bgIsDark(bg);
  const themeDark = bgIsDark(theme.bg);
  // Fundo trocado para o "outro lado" (claro <-> escuro) sem cor de texto escolhida: o texto acompanha.
  const flipped = dark !== themeDark;
  const text = isHex(custom.textColor) ? custom.textColor : flipped ? (dark ? "#FFFFFF" : "#111111") : theme.text;
  const muted = isHex(custom.textColor) || flipped ? `color-mix(in srgb, ${text} 72%, transparent)` : theme.muted;
  const card = flipped ? (dark ? "rgb(255 255 255 / 0.08)" : "rgb(255 255 255 / 0.75)") : theme.card;
  const border = flipped ? (dark ? "rgb(255 255 255 / 0.16)" : "rgb(0 0 0 / 0.1)") : theme.border;
  const btnBg = isHex(custom.buttonColor) ? custom.buttonColor : theme.button.bg;
  const btnText = isHex(custom.buttonColor) ? contrastText(custom.buttonColor) : theme.button.text;
  const ctaBg = isHex(custom.buttonColor) ? custom.buttonColor : theme.cta.bg;
  const ctaText = isHex(custom.buttonColor) ? contrastText(custom.buttonColor) : theme.cta.text;
  const font: FontId = FONT_IDS.includes(custom.font as FontId) ? (custom.font as FontId) : fontHeading === "serif" ? "serif" : theme.font;
  const base = bg.colors.find(isHex) ?? "#0A0E1A";

  return {
    theme,
    bg,
    dark,
    font,
    buttonStyle: BUTTON_STYLES.includes(custom.buttonStyle as ButtonStyle) ? (custom.buttonStyle as ButtonStyle) : theme.button.style,
    buttonShape: BUTTON_SHAPES.includes(custom.buttonShape as ButtonShape) ? (custom.buttonShape as ButtonShape) : theme.button.shape,
    vars: {
      "--t-page": base,
      "--t-text": text,
      "--t-muted": muted,
      "--t-accent": isHex(custom.buttonColor) ? custom.buttonColor : flipped ? text : theme.accent,
      "--t-card": card,
      "--t-border": border,
      "--t-star": theme.star ?? "#FBBF24",
      "--t-btn": btnBg,
      "--t-btn-text": btnText,
      "--t-cta": ctaBg,
      "--t-cta-text": ctaText,
      "--t-glass": dark ? "rgb(255 255 255 / 0.14)" : "rgb(255 255 255 / 0.6)",
      "--t-glass-line": dark ? "rgb(255 255 255 / 0.24)" : "rgb(255 255 255 / 0.85)",
      "--t-heading": FONTS[font].family,
      color: text,
    } as CSSProperties,
  };
}

/** As mesmas classes para todos os temas: as cores vêm das variáveis --t-* do elemento raiz. */
export const PALETTE = {
  page: "bg-[var(--t-page)] text-[var(--t-text)]",
  header: "bg-[color-mix(in_srgb,var(--t-page)_85%,transparent)] border-[var(--t-border)]",
  muted: "text-[var(--t-muted)]",
  accent: "text-[var(--t-accent)]",
  card: "bg-[var(--t-card)] border-[var(--t-border)]",
  badge: "bg-[color-mix(in_srgb,var(--t-accent)_15%,transparent)] text-[var(--t-accent)] border-[color-mix(in_srgb,var(--t-accent)_32%,transparent)]",
  primary: "[background:var(--t-cta)] text-[var(--t-cta-text)] border-transparent hover:brightness-110 shadow-lg shadow-black/10",
  secondary: "[background:var(--t-btn)] text-[var(--t-btn-text)] border-[var(--t-border)] hover:brightness-105",
  line: "border-[var(--t-border)] divide-[var(--t-border)]",
  star: "text-[var(--t-star)]",
} as const;
export type Palette = typeof PALETTE;

const SHAPE: Record<ButtonShape, string> = { pill: "rounded-full", rounded: "rounded-2xl", square: "rounded-md" };

const STYLE: Record<ButtonStyle, string> = {
  filled: "[background:var(--t-btn)] text-[var(--t-btn-text)] border border-transparent",
  outline: "bg-transparent text-[var(--t-text)] border-2 border-[var(--t-text)]",
  soft: "bg-[color-mix(in_srgb,var(--t-btn)_16%,transparent)] text-[var(--t-text)] border border-transparent",
  glass: "bg-[var(--t-glass)] text-[var(--t-text)] border border-[var(--t-glass-line)] backdrop-blur-md",
  hard: "[background:var(--t-btn)] text-[var(--t-btn-text)] border-2 border-[var(--t-text)] shadow-[4px_4px_0_var(--t-text)] hover:shadow-[2px_2px_0_var(--t-text)] hover:translate-x-[2px] hover:translate-y-[2px]",
};

/** Classes de um botão de link da bio no estilo e forma escolhidos. `primary` = o botão do assistente. */
export function buttonClass(style: ButtonStyle, shape: ButtonShape, primary = false) {
  const look = primary
    ? `[background:var(--t-cta)] text-[var(--t-cta-text)] ${style === "hard" ? "border-2 border-[var(--t-text)] shadow-[4px_4px_0_var(--t-text)]" : "border border-transparent shadow-lg shadow-black/10"}`
    : STYLE[style];
  return `${look} ${SHAPE[shape]}`;
}
