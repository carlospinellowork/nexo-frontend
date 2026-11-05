import { Calendar, ChartLine, GitGraph, Globe, House, Link2, type IconComponent, QrCode, Users } from "./icons";
import type { Tone } from "./components/ui/tones";

export interface NavItem {
  to: string;
  title: string;
  icon: IconComponent;
  tone: Tone;
  /** Telas que são abas desta área: o item fica aceso nelas. */
  also?: string[];
}

export interface NavGroup {
  /** Sem rótulo: itens soltos no topo do menu. */
  label?: string;
  items: NavItem[];
}

/** Menu do painel, agrupado pelo que a pessoa quer fazer. O que é detalhe de uma área fica nas abas dela (layout/ToolTabs). */
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ to: "/", title: "Início", icon: House, tone: "violet" }] },
  {
    label: "Presença",
    items: [
      { to: "/minha-bio", title: "Minha Bio", icon: Link2, tone: "rose" },
      { to: "/qr-codes", title: "QR Codes", icon: QrCode, tone: "lagoon" },
    ],
  },
  {
    label: "Atendimento",
    items: [
      { to: "/agenda", title: "Agenda", icon: Calendar, tone: "violet" },
      { to: "/leads", title: "Leads", icon: Users, tone: "green" },
    ],
  },
  { label: "Acompanhar", items: [{ to: "/results", title: "Resultados", icon: ChartLine, tone: "amber" }] },
  {
    label: "Criar",
    items: [
      { to: "/landing-pages", title: "Páginas", icon: Globe, tone: "orange", also: ["/landing-builder", "/chat-builder", "/simulate"] },
      { to: "/flow-builder", title: "Fluxos", icon: GitGraph, tone: "ocean", also: ["/integrations"] },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isNavActive(to: string, pathname: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export const isItemActive = (item: NavItem, pathname: string) => isNavActive(item.to, pathname) || Boolean(item.also?.some((to) => isNavActive(to, pathname)));

/** Item do menu da tela atual (para o cabeçalho mostrar o ícone e a cor da área). */
export function navItemFor(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((i) => i.to !== "/" && isItemActive(i, pathname)) ?? (pathname === "/" ? NAV_ITEMS[0] : undefined);
}
