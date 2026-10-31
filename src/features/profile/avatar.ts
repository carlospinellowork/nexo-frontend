import type { AvatarColor } from "./types";

/** Fundos das iniciais, no estilo dos contatos do iPhone (gradiente suave de cima para baixo). */
export const AVATAR_GRADIENTS: Record<AvatarColor, string> = {
  violet: "linear-gradient(180deg, #a48bff, #6d4aff)",
  blue: "linear-gradient(180deg, #7cb4ff, #2f7bff)",
  teal: "linear-gradient(180deg, #5fe0d2, #0fa89a)",
  green: "linear-gradient(180deg, #7ee29a, #23a455)",
  amber: "linear-gradient(180deg, #ffd96b, #f5a700)",
  orange: "linear-gradient(180deg, #ffad6b, #f26b1d)",
  pink: "linear-gradient(180deg, #ff9cc3, #e9417f)",
  graphite: "linear-gradient(180deg, #a3a8b8, #5d6375)",
};

export function initialsOf(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts.at(-1)![0]}` : (parts[0]?.slice(0, 2) ?? "?");
  return letters.toUpperCase();
}
