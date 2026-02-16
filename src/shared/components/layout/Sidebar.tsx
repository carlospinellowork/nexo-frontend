import { Link } from "@tanstack/react-router";
import { Flame, Settings } from "lucide-react";
import type { ElementType, ReactNode } from "react";

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="w-72 shrink-0 border-r border-border-ui bg-bg-start flex flex-col">
      <div className="h-16 flex items-center gap-3 px-4 mb-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-lg shadow-primary/20">
          <Flame
            size={18}
            className="text-bg-start fill-bg-start"
            strokeWidth={2.5}
          />
        </div>

        <span className="text-lg font-bold tracking-tight text-text-primary">
          Nexo<span className="text-primary">.</span>
        </span>
      </div>

      <nav className="flex flex-col flex-1 p-4 gap-2 overflow-y-auto">
        {children}
      </nav>

      <div className="mt-auto p-4 flex flex-col gap-4 border-t border-border-ui/30">
        <div className="bg-panel/40 border border-border-ui p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            Workspace
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">
              Acme Corp
            </span>
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded border border-primary/20">
              PRO PLAN
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-panel border border-border-ui flex items-center justify-center text-xs font-bold text-text-secondary overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary">
                Alex Silva
              </span>
            </div>
          </div>
          <button className="text-text-secondary hover:text-text-primary hover:rotate-90 transition-all duration-300 cursor-pointer">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function SidebarItem({
  to,
  title,
  Icon,
}: {
  to: string;
  title: string;
  Icon?: ElementType;
}) {
  return (
    <Link
      to={to}
      activeProps={{
        className:
          "bg-primary/10 text-primary border-r-2 border-primary rounded-r-none",
      }}
      inactiveProps={{
        className:
          "text-text-secondary hover:text-text-primary hover:bg-panel/50",
      }}
      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group"
    >
      {Icon && (
        <Icon
          size={20}
          className="group-hover:scale-110 transition-transform"
        />
      )}

      <span className="text-sm font-medium">{title}</span>
    </Link>
  );
}
