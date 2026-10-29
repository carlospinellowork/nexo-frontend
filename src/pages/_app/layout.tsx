import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChartLine, GitGraph, Globe, House, Link2, Menu, Paintbrush, Play, Send, Users, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { type NavItem, Sidebar } from "../../shared/components/layout/Sidebar";
import { LogoMark } from "../../shared/components/ui/Logo";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV: NavItem[] = [
  { to: "/minha-bio", title: "Minha Bio", icon: Link2 },
  { to: "/", title: "Início", icon: House },
  { to: "/flow-builder", title: "Fluxos", icon: GitGraph },
  { to: "/landing-pages", title: "Páginas", icon: Globe },
  { to: "/leads", title: "Leads", icon: Users },
  { to: "/results", title: "Resultados", icon: ChartLine },
  { to: "/simulate", title: "Simulador", icon: Play },
  { to: "/chat-builder", title: "Aparência", icon: Paintbrush },
  { to: "/integrations", title: "Canais", icon: Send },
];

function AppLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/login" });
  }, [session, isPending, navigate]);

  if (isPending || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-start">
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
          <LogoMark size={56} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-bg-start text-text-primary md:h-screen md:flex-row">
      <div className="hidden md:flex">
        <Sidebar items={NAV} />
      </div>

      {/* Celular: barra no topo e menu em gaveta. */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border-ui bg-panel/80 px-2 backdrop-blur-xl md:hidden">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir o menu" className="flex h-11 w-11 items-center justify-center rounded-xl text-text-primary hover:bg-panel-hover">
          <Menu size={22} />
        </button>
        <LogoMark size={28} />
        <span className="text-[17px] font-extrabold tracking-tight">Nexo</span>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <Sidebar items={NAV} className="h-full w-[280px] max-w-[85vw] overflow-y-auto bg-panel" onNavigate={() => setMenuOpen(false)} />
          <button type="button" className="relative flex-1 bg-black/40" aria-label="Fechar o menu" onClick={() => setMenuOpen(false)}>
            <X size={22} className="absolute right-3 top-3 text-white" />
          </button>
        </div>
      )}

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Só animação de entrada. Com AnimatePresence + exit, o elemento que sai também
            renderiza o <Outlet /> da rota nova: a página monta duas vezes (ex.: o simulador
            abria duas sessões e a mensagem do usuário ia para a sessão descartada). */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex h-full min-h-0 flex-col"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
