import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ChevronDown } from "../../icons";
import { ProLock } from "../../../features/plan/ProBadge";
import { isProRoute } from "../../../features/plan/plan";
import { isItemActive, type NavGroup, type NavItem } from "../../navigation";
import { Logo } from "../ui/Logo";
import { gestureFor } from "../ui/gestures";
import { AccountMenu } from "./AccountMenu";

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const { to, title, icon: Icon } = item;
  const active = isItemActive(item, pathname);
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

/** Grupo recolhido por padrão ("Avançado"); começa aberto quando a tela atual é dele. */
function CollapsibleGroup({ group, pathname, onNavigate }: { group: NavGroup; pathname: string; onNavigate?: () => void }) {
  const hasActive = group.items.some((item) => isItemActive(item, pathname));
  const [open, setOpen] = useState(hasActive);
  // Ao entrar numa tela do grupo, ele abre sozinho; depois a pessoa pode fechar.
  const [wasActive, setWasActive] = useState(hasActive);
  if (hasActive !== wasActive) {
    setWasActive(hasActive);
    if (hasActive) setOpen(true);
  }
  const shown = open;
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen(!shown)}
        aria-expanded={shown}
        className="flex h-9 items-center justify-between rounded-[10px] px-2 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-panel-hover hover:text-text-primary md:h-7"
      >
        {group.label}
        <ChevronDown size={15} className={`transition-transform ${shown ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {shown && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-0.5 overflow-hidden">
            {group.items.map((item) => (
              <NavLink key={item.to} item={item} pathname={pathname} onNavigate={onNavigate} />
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={`flex ${className} shrink-0 flex-col gap-5 overflow-y-auto border-r border-border-ui bg-[var(--nx-glass)] px-3 py-4 backdrop-blur-2xl`}
    >
      <div className="px-2">
        <Logo size={30} />
      </div>

      <nav aria-label="Menu principal" className="flex flex-col gap-4">
        {groups.map((group, gi) =>
          group.collapsible ? (
            <CollapsibleGroup key={group.label ?? gi} group={group} pathname={pathname} onNavigate={onNavigate} />
          ) : (
            <div key={group.label ?? gi} className="flex flex-col gap-0.5">
              {group.label && <span className="mb-0.5 px-2 text-[12px] font-semibold text-text-secondary">{group.label}</span>}
              {group.items.map((item) => (
                <NavLink key={item.to} item={item} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          ),
        )}
      </nav>

      <div className="mt-auto">
        <AccountMenu onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
