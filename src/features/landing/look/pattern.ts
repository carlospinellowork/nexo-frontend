import type { CSSProperties } from "react";
import { imageSrc } from "../../uploads/image";
import { isHex } from "./resolve";
import type { Background, BgPattern } from "./types";

/** Desenho de cada textura (SVG repetido). INK = cor do desenho, O = opacidade. */
const PATTERNS: Record<BgPattern, { svg: string; size: number; opacity: number }> = {
  dots: { size: 22, opacity: 0.22, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'><circle cx='4' cy='4' r='1.8' fill='INK' fill-opacity='O'/></svg>" },
  grid: { size: 28, opacity: 0.12, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><path d='M28 0H0V28' fill='none' stroke='INK' stroke-opacity='O' stroke-width='1'/></svg>" },
  diagonal: { size: 12, opacity: 0.1, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M-3 3l6-6M0 12L12 0M9 15l6-6' stroke='INK' stroke-opacity='O' stroke-width='1.5'/></svg>" },
  checker: { size: 48, opacity: 0.08, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='24' height='24' fill='INK' fill-opacity='O'/><rect x='24' y='24' width='24' height='24' fill='INK' fill-opacity='O'/></svg>" },
  waves: { size: 48, opacity: 0.16, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='16'><path d='M0 8c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6' fill='none' stroke='INK' stroke-opacity='O' stroke-width='1.5'/></svg>" },
  hearts: { size: 44, opacity: 0.24, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path transform='translate(14 13)' d='M8 15S1 10.6 1 6a4 4 0 0 1 7-2.6A4 4 0 0 1 15 6c0 4.6-7 9-7 9z' fill='INK' fill-opacity='O'/></svg>" },
  stars: { size: 90, opacity: 0.75, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><g fill='INK' fill-opacity='O'><circle cx='10' cy='14' r='1'/><circle cx='50' cy='8' r='.8'/><circle cx='72' cy='40' r='1.3'/><circle cx='24' cy='58' r='.9'/><circle cx='60' cy='74' r='1'/><circle cx='84' cy='84' r='.7'/><path d='M38 30l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z'/></g></svg>" },
  sparkles: { size: 60, opacity: 0.4, svg: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M15 8l1.6 5.4L22 15l-5.4 1.6L15 22l-1.6-5.4L8 15l5.4-1.6zM44 36l1 3.4 3.4 1-3.4 1-1 3.4-1-3.4-3.4-1 3.4-1z' fill='INK' fill-opacity='O'/></svg>" },
  strawberries: {
    size: 64,
    opacity: 0.55,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><g transform='translate(18 14) scale(1.3)'><path d='M10 6c5 0 9 2 9 7 0 6-5 11-9 13-4-2-9-7-9-13 0-5 4-7 9-7z' fill='INK' fill-opacity='O'/><path d='M3.5 6.5C5 3.5 7.5 3 10 5.5 12.5 3 15 3.5 16.5 6.5 13 8 7 8 3.5 6.5z' fill='#3BA55C' fill-opacity='0.85'/><path d='M10 5.5V2' stroke='#3BA55C' stroke-opacity='0.85' stroke-width='1.4' stroke-linecap='round'/><g fill='#FFF6D6' fill-opacity='0.95'><circle cx='7' cy='11.5' r='.75'/><circle cx='13' cy='11.5' r='.75'/><circle cx='10' cy='15' r='.75'/><circle cx='6.8' cy='18' r='.75'/><circle cx='13.2' cy='18' r='.75'/><circle cx='10' cy='21' r='.75'/></g></g></svg>",
  },
  noise: {
    size: 160,
    opacity: 0.16,
    svg: "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 R 0 0 0 0 G 0 0 0 0 B 0 0 0 O 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
  },
};

export function patternImage(pattern: BgPattern, ink: string) {
  const p = PATTERNS[pattern] ?? PATTERNS.dots;
  const color = isHex(ink) ? ink : "#FFFFFF";
  const [r, g, b] = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(3));
  const svg = p.svg.replaceAll("INK", color).replaceAll("O'", `${p.opacity}'`).replace(" R ", ` ${r} `).replace(" G ", ` ${g} `).replace(" B ", ` ${b} `).replace(" O 0", ` ${p.opacity * 3} 0`);
  return { image: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, size: p.size };
}

/** CSS de fundo (sem a malha, que tem camadas próprias). */
export function backgroundStyle(bg: Background): CSSProperties {
  const colors = bg.colors.filter(isHex);
  const base = colors[0] ?? "#0A0E1A";
  if (bg.type === "gradient" && colors.length > 1) return { backgroundColor: base, backgroundImage: `linear-gradient(${bg.angle ?? 160}deg, ${colors.join(", ")})` };
  if (bg.type === "pattern") {
    const p = patternImage(bg.pattern ?? "dots", colors[1] ?? "#FFFFFF");
    return { backgroundColor: base, backgroundImage: p.image, backgroundSize: `${p.size}px ${p.size}px` };
  }
  if (bg.type === "image" && bg.imageUrl) {
    return { backgroundColor: base, backgroundImage: `linear-gradient(rgb(0 0 0 / 0.28), rgb(0 0 0 / 0.42)), url(${JSON.stringify(imageSrc(bg.imageUrl))})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return { backgroundColor: base };
}

