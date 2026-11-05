import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { X } from "../../shared/icons";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useGetMe } from "../../api/queries/useGetMe";
import { useEnsureActiveWorkspace } from "../../features/workspaces/useEnsureActiveWorkspace";
import { authClient } from "../../lib/auth-client";
import { BottomNav } from "../../shared/components/layout/BottomNav";
import { Sidebar } from "../../shared/components/layout/Sidebar";
import { LogoMark } from "../../shared/components/ui/Logo";
import { NAV_GROUPS } from "../../shared/navigation";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});


/** Fica dentro da parte logada: sem sessão, não há espaços para buscar. */
function EnsureWorkspace() {
  useEnsureActiveWorkspace();
  return null;
}

function AppLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: me } = useGetMe();

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/login" });
  }, [session, isPending, navigate]);

  // Primeiro login: antes do painel, o "conhecer você" (dá para pular).
  useEffect(() => {
    if (me && !me.user.onboarded) navigate({ to: "/boas-vindas" });
  }, [me, navigate]);

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
    <div className="nx-app-bg flex h-dvh w-full flex-col overflow-hidden text-text-primary md:h-screen md:flex-row">
      <div className="hidden md:flex">
        <EnsureWorkspace />
        <Sidebar groups={NAV_GROUPS} />
      </div>

      {/* Celular: barra de navegação embaixo; "Mais" abre o menu completo em gaveta. */}
      <BottomNav onMore={() => setMenuOpen(true)} moreActive={!["/", "/minha-bio", "/agenda", "/leads"].some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)))} />
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <Sidebar groups={NAV_GROUPS} className="h-full w-[280px] max-w-[85vw] overflow-y-auto bg-panel" onNavigate={() => setMenuOpen(false)} />
          <button type="button" className="relative flex-1 bg-black/40" aria-label="Fechar o menu" onClick={() => setMenuOpen(false)}>
            <X size={22} className="absolute right-3 top-3 text-white" />
          </button>
        </div>
      )}

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
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
