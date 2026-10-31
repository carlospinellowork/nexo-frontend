import { ChartLine, GitGraph, Globe, House, Link2, type LucideIcon, Paintbrush, Play, Send, Users } from "lucide-react";
import type { Tone } from "./components/ui/tones";

export interface NavItem {
  to: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
}

export interface NavGroup {
  /** Sem rótulo: itens soltos no topo do menu. */
  label?: string;
  items: NavItem[];
}

/** Menu do painel, agrupado pelo que a pessoa quer fazer. */
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ to: "/", title: "Início", icon: House, tone: "violet" }] },
  {
    label: "Presença",
    items: [
      { to: "/minha-bio", title: "Minha Bio", icon: Link2, tone: "rose" },
      { to: "/landing-pages", title: "Páginas", icon: Globe, tone: "orange" },
    ],
  },
  {
    label: "Assistente",
    items: [
      { to: "/flow-builder", title: "Fluxos", icon: GitGraph, tone: "ocean" },
      { to: "/simulate", title: "Simulador", icon: Play, tone: "mint" },
      { to: "/chat-builder", title: "Aparência", icon: Paintbrush, tone: "violet" },
      { to: "/integrations", title: "Canais", icon: Send, tone: "ocean" },
    ],
  },
  {
    label: "Acompanhar",
    items: [
      { to: "/leads", title: "Leads", icon: Users, tone: "green" },
      { to: "/results", title: "Resultados", icon: ChartLine, tone: "amber" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isNavActive(to: string, pathname: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

/** Item do menu da tela atual (para o cabeçalho mostrar o ícone e a cor da área). */
export function navItemFor(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((i) => i.to !== "/" && isNavActive(i.to, pathname)) ?? (pathname === "/" ? NAV_ITEMS[0] : undefined);
}
