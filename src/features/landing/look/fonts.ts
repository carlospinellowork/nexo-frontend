import type { FontId } from "./types";

/**
 * Letras das bios. Só a Inter vem no pacote do painel; as outras são baixadas quando uma bio (ou a galeria
 * de temas) usa (arquivos do próprio Nexo, sem Google Fonts: nenhum dado do visitante vai para terceiros).
 */
export const FONTS: Record<FontId, { label: string; family: string; load?: () => Promise<unknown> }> = {
  inter: { label: "Moderna", family: "'Inter Variable', Inter, system-ui, sans-serif" },
  serif: { label: "Clássica", family: "Georgia, 'Times New Roman', serif" },
  outfit: { label: "Geométrica", family: "'Outfit Variable', system-ui, sans-serif", load: () => import("@fontsource-variable/outfit") },
  playfair: { label: "Elegante", family: "'Playfair Display Variable', Georgia, serif", load: () => import("@fontsource-variable/playfair-display") },
  "space-grotesk": { label: "Tech", family: "'Space Grotesk Variable', system-ui, sans-serif", load: () => import("@fontsource-variable/space-grotesk") },
  nunito: { label: "Suave", family: "'Nunito Variable', system-ui, sans-serif", load: () => import("@fontsource-variable/nunito") },
  fredoka: { label: "Fofa", family: "'Fredoka Variable', system-ui, sans-serif", load: () => import("@fontsource-variable/fredoka") },
  "dm-serif": { label: "Revista", family: "'DM Serif Display', Georgia, serif", load: () => import("@fontsource/dm-serif-display") },
  pacifico: { label: "Letreiro", family: "'Pacifico', cursive", load: () => import("@fontsource/pacifico") },
  bebas: { label: "Impacto", family: "'Bebas Neue', Impact, sans-serif", load: () => import("@fontsource/bebas-neue") },
  caveat: { label: "À mão", family: "'Caveat Variable', cursive", load: () => import("@fontsource-variable/caveat") },
  "press-start": { label: "Fliperama", family: "'Press Start 2P', monospace", load: () => import("@fontsource/press-start-2p") },
};

const loaded = new Set<FontId>();

/** Baixa a letra (uma vez por sessão). */
export function loadFont(id: FontId) {
  const font = FONTS[id];
  if (!font?.load || loaded.has(id)) return;
  loaded.add(id);
  void font.load().catch(() => loaded.delete(id));
}
