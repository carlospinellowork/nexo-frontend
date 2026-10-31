import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { navItemFor } from "../../navigation";
import { gestureFor } from "../ui/gestures";
import { TONES } from "../ui/tones";

interface HeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** selo ao lado do título (ex.: Rascunho/Salvo) */
  badge?: ReactNode;
  actions?: ReactNode;
}

export function Header({ title, subtitle, badge, actions }: HeaderProps) {
  // Ícone e cor da área da tela atual, vindos do menu.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const area = navItemFor(pathname);
  return (
    <header className="sticky top-0 z-20 flex min-h-[60px] w-full flex-wrap items-center justify-between gap-2.5 border-b border-border-ui bg-[var(--nx-glass)] px-4 py-2.5 backdrop-blur-2xl md:px-6">
      <div className="nx-anim-once flex min-w-0 items-center gap-2.5">
        {area && (
          <span className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-[10px] sm:flex ${TONES[area.tone].chip}`}>
            <area.icon size={17} strokeWidth={2.2} data-gesture={gestureFor(area.icon)} />
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-[18px] font-bold tracking-tight text-text-primary">{title}</h1>
          {subtitle && <span className="truncate text-[12.5px] text-text-secondary">{subtitle}</span>}
        </div>
        {badge}
      </div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </header>
  );
}
