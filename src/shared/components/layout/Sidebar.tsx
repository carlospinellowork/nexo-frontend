import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { WorkspaceSelector } from "../../../features/workspaces/components/WorkspaceSelector";
import { authClient } from "../../../lib/auth-client";
import { Logo } from "../ui/Logo";
import { ThemeSegmented } from "../ui/ThemeToggle";

export interface NavItem {
  to: string;
  title: string;
  icon: LucideIcon;
}

function initials(name?: string | null) {
  return (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Sidebar({ items, className = "w-[264px]", onNavigate }: { items: NavItem[]; className?: string; onNavigate?: () => void }) {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => navigate({ to: "/login" }) } });
  };

  return (
    <aside className={`flex ${className} shrink-0 flex-col gap-7 border-r border-border-ui bg-[var(--nx-glass)] px-4 py-6 backdrop-blur-2xl`}>
      <div className="px-2">
        <Logo size={36} />
      </div>

      <nav aria-label="Menu principal" className="flex flex-col gap-1">
        {items.map(({ to, title, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors ${
                active ? "font-semibold text-primary-strong" : "font-medium text-text-primary hover:bg-panel-hover"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className="absolute inset-0 rounded-xl bg-primary/12"
                />
              )}
              <Icon size={20} strokeWidth={2} className="relative" />
              <span className="relative">{title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <WorkspaceSelector />
        <ThemeSegmented />
        <div className="flex items-center gap-3 rounded-2xl border border-border-ui bg-panel p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/14 text-[13px] font-bold text-accent-strong">
            {initials(session?.user.name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14px] font-semibold text-text-primary">{session?.user.name ?? "Usuário"}</span>
            <span className="truncate text-[12px] text-text-secondary">{session?.user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/12 hover:text-danger"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
