/**
 * Cores das áreas do painel. Cada área (Bio, Páginas, Fluxos...) tem um tom, usado no menu, no
 * cabeçalho da tela e nos cartões do Início. As classes ficam escritas por extenso para o Tailwind
 * encontrá-las.
 */
export type Tone = "violet" | "rose" | "orange" | "ocean" | "mint" | "green" | "amber" | "lagoon";

interface ToneClasses {
  /** Ícone sobre fundo tingido (chip). */
  chip: string;
  /** Chip mais forte, para o item ativo do menu. */
  chipActive: string;
  /** Fundo tingido de uma linha ou cartão ativo. */
  soft: string;
  /** Texto e ícone na cor da área. */
  text: string;
  /** Brilho atrás de cartões (cor sólida, usada com blur e opacidade). */
  glow: string;
}

export const TONES: Record<Tone, ToneClasses> = {
  violet: { chip: "bg-primary/12 text-primary", chipActive: "bg-primary/22 text-primary-strong", soft: "bg-primary/10", text: "text-primary-strong", glow: "bg-primary" },
  rose: { chip: "bg-rose/12 text-rose", chipActive: "bg-rose/22 text-rose-strong", soft: "bg-rose/10", text: "text-rose-strong", glow: "bg-rose" },
  orange: { chip: "bg-warning/14 text-warning", chipActive: "bg-warning/24 text-warning-strong", soft: "bg-warning/10", text: "text-warning-strong", glow: "bg-warning" },
  ocean: { chip: "bg-ocean/12 text-ocean", chipActive: "bg-ocean/22 text-ocean-strong", soft: "bg-ocean/10", text: "text-ocean-strong", glow: "bg-ocean" },
  mint: { chip: "bg-mint/14 text-mint-strong", chipActive: "bg-mint/24 text-mint-strong", soft: "bg-mint/10", text: "text-mint-strong", glow: "bg-mint" },
  green: { chip: "bg-success/14 text-success-strong", chipActive: "bg-success/24 text-success-strong", soft: "bg-success/10", text: "text-success-strong", glow: "bg-success" },
  lagoon: { chip: "bg-lagoon/14 text-lagoon-strong", chipActive: "bg-lagoon/24 text-lagoon-strong", soft: "bg-lagoon/10", text: "text-lagoon-strong", glow: "bg-lagoon" },
  amber: { chip: "bg-accent/18 text-accent-strong", chipActive: "bg-accent/30 text-accent-strong", soft: "bg-accent/12", text: "text-accent-strong", glow: "bg-accent" },
};
