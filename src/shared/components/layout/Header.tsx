import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { navItemFor } from "../../navigation";
import { gestureFor } from "../ui/gestures";

interface HeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** selo ao lado do título (ex.: Rascunho/Salvo) */
  badge?: ReactNode;
  actions?: ReactNode;
  /** Abas da área (ToolTabs), logo depois do título. */
  tabs?: ReactNode;
}

export function Header({ title, subtitle, badge, actions, tabs }: HeaderProps) {
  // Ícone e cor da área da tela atual, vindos do menu.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const area = navItemFor(pathname);
  return (
    <header className="sticky top-0 z-20 flex min-h-[56px] w-full flex-col gap-2 border-b border-border-ui bg-[var(--nx-glass)] px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-2xl md:min-h-[60px] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-2.5 md:px-6 md:pt-2.5">
      <div className="nx-anim-once flex min-w-0 items-center gap-2.5">
        {area && (
          <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary sm:flex">
            <area.icon size={17} strokeWidth={2.2} data-gesture={gestureFor(area.icon)} />
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-[18px] font-bold tracking-tight text-text-primary">{title}</h1>
          {subtitle && <span className="truncate text-[12.5px] text-text-secondary">{subtitle}</span>}
        </div>
        {badge}
        {tabs && <div className="ml-2 hidden lg:block">{tabs}</div>}
      </div>
      {tabs && <div className="nx-phone-scroll -mx-4 overflow-x-auto px-4 lg:hidden">{tabs}</div>}
      {/* Celular: as ações numa linha que rola de lado (nada fica cortado). */}
      {actions && <div className="nx-phone-scroll -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&>*]:shrink-0">{actions}</div>}
    </header>
  );
}
