import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { navItemFor } from "../../navigation";
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
    <header className="sticky top-0 z-20 flex min-h-[72px] w-full flex-wrap items-center justify-between gap-3 border-b border-border-ui bg-[var(--nx-glass)] px-7 py-3 backdrop-blur-2xl">
      <div className="flex min-w-0 items-center gap-3">
        {area && (
          <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${TONES[area.tone].chip}`}>
            <area.icon size={20} strokeWidth={2.1} />
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-[20px] font-bold tracking-tight text-text-primary">{title}</h1>
          {subtitle && <span className="truncate text-[13px] text-text-secondary">{subtitle}</span>}
        </div>
        {badge}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
    </header>
  );
}
