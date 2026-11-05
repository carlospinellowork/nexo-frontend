import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useGetMe } from "../../../api/queries/useGetMe";
import { FeedbackButton } from "../../../features/feedback/FeedbackButton";
import { UserAvatar } from "../../../features/profile/UserAvatar";
import { PushMenuItem } from "../../../features/push/PushPrompt";
import { InstallMenuItem } from "../../../features/pwa/InstallApp";
import { WorkspaceSelector } from "../../../features/workspaces/components/WorkspaceSelector";
import { authClient } from "../../../lib/auth-client";
import { ChevronDown, Gauge, LogOut, Pencil, UserRound } from "../../icons";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Popover } from "../ui/Popover";
import { ThemeSegmented } from "../ui/ThemeToggle";

const row = "nx-anim flex h-11 w-full items-center gap-2.5 rounded-xl px-2.5 text-[14px] font-medium text-text-primary transition-colors hover:bg-panel-hover md:h-9";

/** Tudo da conta num lugar só: o cartão com a foto, o nome e o e-mail abre para cima e fecha ao trocar de tela. */
export function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const reduce = useReducedMotion();
  const { data: session } = authClient.useSession();
  const { data: me } = useGetMe();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mobile = useIsMobile();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  const logout = () => authClient.signOut({ fetchOptions: { onSuccess: () => navigate({ to: "/login" }) } });
  const go = () => onNavigate?.();

  const items = (
    <div className="flex flex-col gap-0.5 p-1.5">
      <Link to="/conta" onClick={go} className={row}>
        <UserRound size={17} className="text-primary" /> Minha conta
      </Link>
      <Link to="/boas-vindas" search={{ editar: true }} onClick={go} className={row}>
        <Pencil size={16} className="text-primary" /> Editar perfil
      </Link>
      {me?.user.isAdmin && (
        <Link to="/admin" onClick={go} className={row}>
          <Gauge size={16} className="text-primary" /> Acompanhamento
        </Link>
      )}
      <PushMenuItem />
      <FeedbackButton />
      <InstallMenuItem onDone={onNavigate} />
      <div className="flex flex-col gap-1.5 px-1 py-1.5">
        <span className="px-1 text-[12px] font-semibold text-text-secondary">Empresa</span>
        <WorkspaceSelector />
      </div>
      <div className="flex flex-col gap-1.5 px-1 pb-1">
        <span className="px-1 text-[12px] font-semibold text-text-secondary">Tema</span>
        <ThemeSegmented />
      </div>
      <button type="button" onClick={() => void logout()} className={`${row} text-danger hover:bg-danger/10`}>
        <LogOut size={17} /> Sair
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border bg-panel transition-colors ${open ? "border-primary/40 shadow-float" : "border-border-ui"}`}>
      {/* Celular: abre no lugar, dentro da gaveta. Computador: painel ao lado, sem mudar a altura do menu. */}
      <AnimatePresence initial={false}>
        {open && mobile && (
          <motion.div id="account-menu" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 38 }} className="overflow-hidden border-b border-border-ui">
            {items}
          </motion.div>
        )}
      </AnimatePresence>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls="account-menu" aria-label={`Conta de ${me?.user.name ?? session?.user.name ?? "usuário"}`} onClick={() => setOpen(!open)} className="flex min-h-14 w-full items-center gap-2.5 p-2 text-left transition-colors hover:bg-panel-hover">
        <UserAvatar name={me?.user.name ?? session?.user.name} color={me?.user.avatarColor} image={me?.user.avatarImage} size={32} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold text-text-primary">{me?.user.name ?? session?.user.name ?? "Usuário"}</span>
          <span className="truncate text-[11.5px] text-text-secondary">{session?.user.email}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-text-secondary transition-transform duration-200 ${mobile ? (open ? "" : "rotate-180") : open ? "rotate-90" : "-rotate-90"}`} />
      </button>
      {open && !mobile && (
        <Popover anchor={trigger} onClose={close} side="right" minWidth={288} opensDialogs label="Menu da conta">
          <div id="account-menu">{items}</div>
        </Popover>
      )}
    </div>
  );
}
