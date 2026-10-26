import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChartLine, GitGraph, Globe, House, Paintbrush, Play, Send, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { authClient } from "../../lib/auth-client";
import { type NavItem, Sidebar } from "../../shared/components/layout/Sidebar";
import { LogoMark } from "../../shared/components/ui/Logo";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV: NavItem[] = [
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
    <div className="flex h-screen w-full overflow-hidden bg-bg-start text-text-primary">
      <Sidebar items={NAV} />
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
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
