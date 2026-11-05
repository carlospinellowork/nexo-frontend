import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, House, Link2, type IconComponent, Menu, Users } from "../../icons";
import { motion } from "motion/react";
import { isNavActive } from "../../navigation";
import { gestureFor } from "../ui/gestures";

const ITEMS: { to: string; label: string; icon: IconComponent }[] = [
  { to: "/", label: "Início", icon: House },
  { to: "/minha-bio", label: "Bio", icon: Link2 },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/leads", label: "Leads", icon: Users },
];

/**
 * Navegação do celular: barra fixa embaixo, ao alcance do polegar. "Mais" abre o menu completo
 * (Páginas, QR Codes, Fluxos, Canais...). Some no computador, onde fica o menu lateral.
 */
export function BottomNav({ onMore, moreActive }: { onMore: () => void; moreActive: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cls = "nx-anim relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold";
  return (
    <nav
      aria-label="Navegação"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-ui bg-[var(--nx-glass)] px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden"
    >
      {ITEMS.map(({ to, label, icon: Icon }) => {
        const active = isNavActive(to, pathname);
        return (
          <Link key={to} to={to} aria-current={active ? "page" : undefined} className={`${cls} ${active ? "nx-anim-once text-primary" : "text-text-secondary"}`}>
            {active && <motion.span layoutId="bottomnav-active" transition={{ type: "spring", stiffness: 500, damping: 40 }} className="absolute top-[6px] h-[30px] w-12 rounded-full bg-primary/12" />}
            <Icon size={23} filled={active} className="relative" data-gesture={gestureFor(Icon)} />
            <span className="relative">{label}</span>
          </Link>
        );
      })}
      <button type="button" onClick={onMore} className={`${cls} ${moreActive ? "text-primary" : "text-text-secondary"}`}>
        <Menu size={21} strokeWidth={moreActive ? 2.4 : 2} />
        <span>Mais</span>
      </button>
    </nav>
  );
}
