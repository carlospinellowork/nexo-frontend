import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { motion } from "motion/react";
import { WorkspaceSelector } from "../../../features/workspaces/components/WorkspaceSelector";
import { authClient } from "../../../lib/auth-client";
import { isNavActive, type NavGroup } from "../../navigation";
import { Logo } from "../ui/Logo";
import { ThemeSegmented } from "../ui/ThemeToggle";
import { TONES } from "../ui/tones";

function initials(name?: string | null) {
  return (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Sidebar({ groups, className = "w-[264px]", onNavigate }: { groups: NavGroup[]; className?: string; onNavigate?: () => void }) {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => navigate({ to: "/login" }) } });
  };

  return (
    <aside className={`flex ${className} shrink-0 flex-col gap-6 overflow-y-auto border-r border-border-ui bg-[var(--nx-glass)] px-4 py-6 backdrop-blur-2xl`}>
      <div className="px-2">
        <Logo size={36} />
      </div>

      <nav aria-label="Menu principal" className="flex flex-col gap-5">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} className="flex flex-col gap-0.5">
            {group.label && <span className="mb-1 px-3 text-[13px] font-semibold text-text-secondary">{group.label}</span>}
            {group.items.map(({ to, title, icon: Icon, tone }) => {
              const active = isNavActive(to, pathname);
              const t = TONES[tone];
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  className={`group relative flex h-11 items-center gap-3 rounded-xl px-2 text-[15px] transition-colors ${
                    active ? "font-semibold text-text-primary" : "font-medium text-text-primary hover:bg-panel-hover"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      className={`absolute inset-0 rounded-xl ${t.soft}`}
                    />
                  )}
                  <span
                    className={`relative flex h-8 w-8 items-center justify-center rounded-[10px] transition-colors ${
                      active ? t.chipActive : `${t.chip} opacity-80 group-hover:opacity-100`
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.1} />
                  </span>
                  <span className="relative">{title}</span>
                </Link>
              );
            })}
          </div>
        ))}
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
