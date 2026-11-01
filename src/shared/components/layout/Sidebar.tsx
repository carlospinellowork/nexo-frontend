import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Gauge, LogOut, SlidersHorizontal } from "../../icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGetMe } from "../../../api/queries/useGetMe";
import { UserAvatar } from "../../../features/profile/UserAvatar";
import { FeedbackButton } from "../../../features/feedback/FeedbackButton";
import { InstallMenuItem } from "../../../features/pwa/InstallApp";
import { PushMenuItem } from "../../../features/push/PushPrompt";
import { WorkspaceSelector } from "../../../features/workspaces/components/WorkspaceSelector";
import { authClient } from "../../../lib/auth-client";
import { isNavActive, type NavGroup, type NavItem } from "../../navigation";
import { Logo } from "../ui/Logo";
import { ThemeSegmented } from "../ui/ThemeToggle";
import { ProLock } from "../../../features/plan/ProBadge";
import { isProRoute } from "../../../features/plan/plan";
import { gestureFor } from "../ui/gestures";

const ADVANCED_KEY = "nexo:nav-advanced";

function readOpen(): boolean | null {
  try {
    const v = localStorage.getItem(ADVANCED_KEY);
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
}

function NavLink({
  item: { to, title, icon: Icon },
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNavActive(to, pathname);
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`nx-anim group relative flex h-11 items-center gap-2.5 rounded-[10px] px-1.5 text-[14px] transition-colors md:h-9 ${active ? "nx-anim-once" : ""} ${
        active
          ? "font-semibold text-text-primary"
          : "font-medium text-text-primary hover:bg-panel-hover"
      }`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          className="absolute inset-0 rounded-[10px] bg-primary/10"
        />
      )}
      <span
        className={`relative flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
          active
            ? "bg-primary text-white shadow-[0_4px_10px_-2px_color-mix(in_srgb,var(--nx-primary)_55%,transparent)]"
            : "text-text-secondary group-hover:text-text-primary"
        }`}
      >
        <Icon size={17} filled={active} data-gesture={gestureFor(Icon)} />
      </span>
      <span className="relative">{title}</span>
      {isProRoute(to) && <span className="relative ml-auto"><ProLock /></span>}
    </Link>
  );
}

/**
 * Páginas, fluxos, canais...: recolhido para quem está começando (o essencial é a bio e o WhatsApp).
 * Abre sozinho quando a pessoa está numa dessas telas; a escolha de abrir ou fechar fica lembrada no aparelho.
 */
function AdvancedGroup({
  group,
  pathname,
  onNavigate,
  defaultOpen,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate?: () => void;
  defaultOpen: boolean;
}) {
  const [saved, setSaved] = useState(readOpen);
  const inside = group.items.some((i) => isNavActive(i.to, pathname));
  const open = inside || (saved ?? defaultOpen);
  const toggle = () => {
    const next = !open;
    setSaved(next);
    try {
      localStorage.setItem(ADVANCED_KEY, next ? "1" : "0");
    } catch {
      /* sem armazenamento: só não lembra */
    }
  };
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        disabled={inside}
        className="flex h-11 items-center gap-2.5 rounded-[10px] px-1.5 text-left text-[13px] font-semibold text-text-secondary transition-colors hover:bg-panel-hover hover:text-text-primary disabled:hover:bg-transparent md:h-9"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg">
          <SlidersHorizontal size={16} strokeWidth={2.2} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          {group.label}
          {!open && (
            <span className="truncate text-[11.5px] font-medium">
              Páginas, fluxos e canais
            </span>
          )}
        </span>
        {!inside && (
          <ChevronDown
            size={16}
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-0.5 overflow-hidden"
          >
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({
  groups,
  className = "w-[232px]",
  onNavigate,
}: {
  groups: NavGroup[];
  className?: string;
  onNavigate?: () => void;
}) {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: me } = useGetMe();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/login" }) },
    });
  };

  return (
    <aside
      className={`flex ${className} shrink-0 flex-col gap-5 overflow-y-auto border-r border-border-ui bg-[var(--nx-glass)] px-3 py-4 backdrop-blur-2xl`}
    >
      <div className="px-2">
        <Logo size={30} />
      </div>

      <nav aria-label="Menu principal" className="flex flex-col gap-4">
        {groups.map((group, gi) =>
          group.advanced ? (
            <AdvancedGroup
              key={group.label ?? gi}
              group={group}
              pathname={pathname}
              onNavigate={onNavigate}
              defaultOpen={me?.workspace.profile.goal === "autoreply"}
            />
          ) : (
            <div key={group.label ?? gi} className="flex flex-col gap-0.5">
              {group.label && (
                <span className="mb-0.5 px-2 text-[12px] font-semibold text-text-secondary">
                  {group.label}
                </span>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ),
        )}
      </nav>

      {me?.user.isAdmin && (
        <Link
          to="/admin"
          onClick={onNavigate}
          className={`nx-anim flex h-11 items-center gap-2.5 rounded-[10px] px-1.5 text-[14px] font-medium md:h-9 ${isNavActive("/admin", pathname) ? "bg-primary/10 font-semibold text-text-primary" : "text-text-primary hover:bg-panel-hover"}`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary">
            <Gauge size={16} strokeWidth={2.2} data-gesture="pop" />
          </span>
          Acompanhamento
        </Link>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <FeedbackButton />
        <PushMenuItem />
        <InstallMenuItem onDone={onNavigate} />
        <WorkspaceSelector />
        <ThemeSegmented />
        <div className="flex items-center gap-2.5 rounded-xl border border-border-ui bg-panel p-2">
          <Link
            to="/boas-vindas"
            search={{ editar: true }}
            onClick={onNavigate}
            aria-label="Editar o seu perfil"
            title="Editar o seu perfil"
            className="shrink-0 rounded-full transition-transform hover:scale-105"
          >
            <UserAvatar
              name={me?.user.name ?? session?.user.name}
              color={me?.user.avatarColor}
              image={me?.user.avatarImage}
              size={32}
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold text-text-primary">
              {me?.user.name ?? session?.user.name ?? "Usuário"}
            </span>
            <span className="truncate text-[11.5px] text-text-secondary">
              {session?.user.email}
            </span>
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
