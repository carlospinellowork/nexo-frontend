/**
 * Cor das áreas do painel. Decisão de 31/10/2026: o Nexo usa UMA cor (o roxo da marca) em ícones, chips e
 * destaques de todas as áreas, em vez de uma cor por área. Os nomes dos tons continuam existindo só para
 * não quebrar quem os usa; todos apontam para a mesma classe. Cores de estado (sucesso, aviso, erro) não
 * são tons de área: use Badge/success/warning/danger.
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

const BRAND: ToneClasses = {
  chip: "bg-primary/12 text-primary",
  chipActive: "bg-primary/22 text-primary-strong",
  soft: "bg-primary/10",
  text: "text-primary-strong",
  glow: "bg-primary",
};

export const TONES: Record<Tone, ToneClasses> = {
  violet: BRAND,
  rose: BRAND,
  orange: BRAND,
  ocean: BRAND,
  mint: BRAND,
  green: BRAND,
  amber: BRAND,
  lagoon: BRAND,
};
