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
  /** Grupo recolhido por padrão; abre sozinho quando a tela atual é dele. */
  collapsible?: boolean;
  items: NavItem[];
}

/**
 * Menu do painel na ordem da jornada do cliente (decisão de 07/11/2026): a bio e a agenda, depois os clientes que chegaram.
 * Ferramentas para montar jornadas sob medida ficam em "Avançado", recolhido. Detalhe de uma área fica nas abas dela (layout/ToolTabs).
 */
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ to: "/", title: "Início", icon: House, tone: "violet" }] },
  {
    label: "Sua jornada",
    items: [
      { to: "/minha-bio", title: "Minha Bio", icon: Link2, tone: "rose" },
      { to: "/agenda", title: "Agenda", icon: Calendar, tone: "violet" },
      { to: "/qr-codes", title: "QR Codes", icon: QrCode, tone: "lagoon" },
    ],
  },
  {
    label: "Seus clientes",
    items: [
      { to: "/leads", title: "Leads", icon: Users, tone: "green" },
      { to: "/results", title: "Resultados", icon: ChartLine, tone: "amber" },
    ],
  },
  {
    label: "Avançado",
    collapsible: true,
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
