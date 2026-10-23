import type { ReactNode } from "react";

interface HeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** selo ao lado do título (ex.: Rascunho/Salvo) */
  badge?: ReactNode;
  actions?: ReactNode;
}

export function Header({ title, subtitle, badge, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] w-full flex-wrap items-center justify-between gap-3 border-b border-border-ui bg-[var(--nx-glass)] px-7 py-3 backdrop-blur-2xl">
      <div className="flex min-w-0 items-center gap-3">
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
