import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  tools?: ReactNode;
}

export function Header({ title, subtitle, actions, tools }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border-ui bg-bg-start flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold text-text-primary tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <div className="flex items-center px-2 py-0.5 rounded bg-panel border border-border-ui">
            <span className="text-[10px] font-semibold text-text-secondary/80 uppercase tracking-widest">
              {subtitle}
            </span>
          </div>
        )}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        {tools}
      </div>

      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}
