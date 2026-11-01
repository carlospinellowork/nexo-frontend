/**
 * Sistema de visual das bios: um tema é uma combinação pronta de fundo, cores, botões e letra. O dono pode
 * trocar cada parte ("Personalizar"), e o que ele muda fica em `settings.look` (espelho de LandingLookSchema
 * em nexo-backend/src/domain/landing/contract.ts).
 */
export const BG_TYPES = ["solid", "gradient", "mesh", "pattern", "image"] as const;
export type BgType = (typeof BG_TYPES)[number];

export const BG_PATTERNS = ["dots", "grid", "diagonal", "checker", "waves", "hearts", "stars", "sparkles", "strawberries", "noise"] as const;
export type BgPattern = (typeof BG_PATTERNS)[number];

export interface Background {
  type: BgType;
  /** solid: [cor]; gradient: 2 ou 3 cores; mesh: 3 ou 4 (a primeira é a base); pattern: [base, desenho]; image: [cor por trás]. */
  colors: string[];
  angle?: number;
  pattern?: BgPattern;
  imageUrl?: string;
}

export const BUTTON_STYLES = ["filled", "outline", "soft", "glass", "hard"] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

export const BUTTON_SHAPES = ["pill", "rounded", "square"] as const;
export type ButtonShape = (typeof BUTTON_SHAPES)[number];

export const FONT_IDS = ["inter", "serif", "outfit", "playfair", "space-grotesk", "nunito", "fredoka", "dm-serif", "pacifico", "bebas", "caveat", "press-start"] as const;
export type FontId = (typeof FONT_IDS)[number];

/** O que o dono mudou por cima do tema (tudo opcional; cores sempre #RRGGBB). */
export interface LandingLook {
  background?: Background;
  buttonStyle?: ButtonStyle;
  buttonShape?: ButtonShape;
  buttonColor?: string;
  textColor?: string;
  font?: FontId;
}

export const THEME_CATEGORIES = ["classicos", "claros", "escuros", "coloridos", "divertidos", "negocios"] as const;
export type ThemeCategory = (typeof THEME_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ThemeCategory, string> = {
  classicos: "Clássicos",
  claros: "Claros",
  escuros: "Escuros",
  coloridos: "Coloridos",
  divertidos: "Divertidos",
  negocios: "Por negócio",
};

export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  bg: Background;
  /** Cores em CSS (os temas prontos podem usar rgb com transparência; o que o dono escolhe é sempre #RRGGBB). */
  text: string;
  muted: string;
  accent: string;
  card: string;
  border: string;
  star?: string;
  /** Botões dos links. `bg` aceita degradê. */
  button: { bg: string; text: string; style: ButtonStyle; shape: ButtonShape };
  /** Botão de destaque (conversar com o assistente). */
  cta: { bg: string; text: string };
  font: FontId;
}
