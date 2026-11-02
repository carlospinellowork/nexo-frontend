import type { BgType, ButtonShape, ButtonStyle, LandingLook } from "./types";

/*
 * "Tema da sua foto": o Nexo lê as cores da foto de perfil (no próprio aparelho, sem IA e sem mandar a foto para
 * lugar nenhum) e monta temas que combinam com ela. Funções puras: a leitura dos pixels fica no componente.
 */

type Hsl = { h: number; s: number; l: number };

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export function hexToHsl(hex: string): Hsl {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const a = clamp(s) * Math.min(clamp(l), 1 - clamp(l));
  const f = (n: number) => {
    const k = (n + ((h % 360) + 360) % 360 / 30) % 12;
    const c = clamp(l) - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/**
 * As cores marcantes de uma imagem (pixels RGBA, ex.: de um canvas de 48x48). Agrupa cores parecidas, dá peso a
 * quem aparece mais e a quem é mais viva, e devolve até 5, diferentes entre si, da mais importante para a menos.
 */
export function extractColors(pixels: Uint8ClampedArray): string[] {
  const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
  let total = 0;
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    if (pixels[i + 3] < 200) continue;
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const cell = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    cell.r += r;
    cell.g += g;
    cell.b += b;
    cell.n += 1;
    buckets.set(key, cell);
    total += 1;
  }
  if (!total) return [];
  const candidates = [...buckets.values()]
    .map((c) => {
      const hex = `#${[c.r, c.g, c.b].map((v) => Math.round(v / c.n).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
      const hsl = hexToHsl(hex);
      // Cinza, quase branco e quase preto contam menos: o tema precisa de cor.
      const vivid = hsl.s * (1 - Math.abs(hsl.l - 0.5) * 1.4);
      return { hex, hsl, score: (c.n / total) * (0.25 + vivid * 1.5) };
    })
    .sort((a, b) => b.score - a.score);

  const picked: typeof candidates = [];
  for (const c of candidates) {
    const distinct = picked.every((p) => hueGap(p.hsl.h, c.hsl.h) > 22 || Math.abs(p.hsl.l - c.hsl.l) > 0.28 || Math.abs(p.hsl.s - c.hsl.s) > 0.35);
    if (distinct) picked.push(c);
    if (picked.length === 5) break;
  }
  return picked.map((p) => p.hex);
}

export interface PhotoLook {
  id: string;
  name: string;
  /** Tema-base (claro ou escuro) por baixo do que a foto define. */
  theme: string;
  look: LandingLook;
}

/** Quatro temas a partir das cores da foto: noite, dia, degradê e aurora. */
export function photoLooks(colors: string[]): PhotoLook[] {
  const list = colors.length ? colors : ["#6D4AFF"];
  const hsl = list.map(hexToHsl);
  const main = hsl[0];
  // A cor mais viva vira a cor dos botões; sem nenhuma viva (foto em preto e branco), usa a principal.
  const vivid = [...hsl].sort((a, b) => b.s * (1 - Math.abs(b.l - 0.5)) - a.s * (1 - Math.abs(a.l - 0.5)))[0];
  const other = hsl.find((c) => hueGap(c.h, vivid.h) > 25 && c.s > 0.15) ?? { ...vivid, h: (vivid.h + 40) % 360 };
  const third = hsl.find((c) => c !== other && hueGap(c.h, vivid.h) > 25 && hueGap(c.h, other.h) > 25) ?? { ...other, h: (other.h + 40) % 360 };
  const vs = Math.max(vivid.s, 0.55);
  const gray = vivid.s < 0.12;

  const make = (id: string, name: string, theme: string, bgType: BgType, bg: string[], text: string, button: string, buttonStyle: ButtonStyle, buttonShape: ButtonShape, angle?: number): PhotoLook => ({
    id,
    name,
    theme,
    look: { background: { type: bgType, colors: bg, ...(angle !== undefined ? { angle } : {}) }, textColor: text, buttonColor: button, buttonStyle, buttonShape },
  });

  return [
    make(
      "noite",
      "Noite",
      "midnight-dark",
      "solid",
      [hslToHex({ h: main.h, s: Math.min(main.s, 0.45), l: 0.1 })],
      "#FFFFFF",
      hslToHex({ h: vivid.h, s: gray ? 0 : vs, l: gray ? 0.92 : 0.58 }),
      "filled",
      "pill",
    ),
    make(
      "dia",
      "Dia",
      "neve",
      "solid",
      [hslToHex({ h: main.h, s: Math.min(main.s, 0.5), l: 0.95 })],
      hslToHex({ h: main.h, s: Math.min(main.s, 0.35), l: 0.14 }),
      hslToHex({ h: vivid.h, s: gray ? 0 : vs, l: gray ? 0.15 : 0.4 }),
      "filled",
      "rounded",
    ),
    make(
      "degrade",
      "Degradê",
      "midnight-dark",
      "gradient",
      [hslToHex({ h: vivid.h, s: gray ? 0.05 : 0.62, l: 0.44 }), hslToHex({ h: other.h, s: gray ? 0.05 : 0.55, l: 0.24 })],
      "#FFFFFF",
      "#FFFFFF",
      "glass",
      "pill",
      160,
    ),
    make(
      "aurora",
      "Aurora",
      "midnight-dark",
      "mesh",
      [
        hslToHex({ h: main.h, s: Math.min(main.s, 0.5), l: 0.1 }),
        hslToHex({ h: vivid.h, s: gray ? 0.05 : vs, l: 0.48 }),
        hslToHex({ h: other.h, s: gray ? 0.05 : 0.6, l: 0.42 }),
        hslToHex({ h: third.h, s: gray ? 0.05 : 0.55, l: 0.36 }),
      ],
      "#FFFFFF",
      hslToHex({ h: vivid.h, s: gray ? 0 : vs, l: gray ? 0.9 : 0.62 }),
      "soft",
      "rounded",
    ),
  ];
}
