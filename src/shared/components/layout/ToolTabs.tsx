import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";

const GROUPS = {
  pages: [
    { to: "/landing-pages", label: "Páginas" },
    { to: "/chat-builder", label: "Aparência do chat" },
    { to: "/simulate", label: "Testar conversa" },
  ],
  flows: [
    { to: "/flow-builder", label: "Editor" },
    { to: "/integrations", label: "Canais" },
  ],
} as const;

/** Abas de uma área: o que é detalhe dela fica aqui, e não no menu. */
export function ToolTabs({ area }: { area: keyof typeof GROUPS }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Partes desta área" className="flex shrink-0 items-center gap-0.5 rounded-[11px] bg-text-secondary/10 p-[3px]">
      {GROUPS[area].map((tab) => {
        const active = pathname.startsWith(tab.to);
        return (
          <Link key={tab.to} to={tab.to} aria-current={active ? "page" : undefined} className={`relative flex h-9 items-center whitespace-nowrap rounded-[9px] px-3 text-[13px] font-semibold transition-colors md:h-8 ${active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>
            {active && <motion.span layoutId={`tool-tab-${area}`} transition={{ type: "spring", stiffness: 500, damping: 38 }} className="absolute inset-0 rounded-[9px] bg-panel shadow-sm" />}
            <span className="relative">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
