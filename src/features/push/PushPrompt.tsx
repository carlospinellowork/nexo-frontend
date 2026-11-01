import { Bell, BellOff, BellRing, X } from "../../shared/icons";
import { useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "../../shared/components/ui/toast-store";
import { usePush } from "./usePush";

const DISMISS_KEY = "nexo-push-dismissed";

const failed = (err: unknown) => toast.error(apiErrorMessage(err, "Não foi possível ligar os avisos neste aparelho."));

/** Cartão do Início: convida a ligar o aviso de "alguém foi para o seu WhatsApp". Pode ser dispensado. */
export function PushCard() {
  const push = usePush();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  if (push.status !== "off" || dismissed) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* sem armazenamento: só esconde nesta visita */
    }
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-panel p-3 shadow-card">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C4B] dark:text-[#4ade80]">
        <BellRing size={20} data-gesture="ring" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14px] font-semibold text-text-primary">Ser avisado na hora</span>
        <span className="text-[12.5px] text-text-secondary">Quando alguém for para o seu WhatsApp, o Nexo te avisa neste aparelho.</span>
      </span>
      <Button size="sm" loading={push.busy} onClick={() => push.enable().catch(failed)}>
        Ligar
      </Button>
      <button type="button" onClick={dismiss} aria-label="Agora não" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
        <X size={16} />
      </button>
    </div>
  );
}

/** Item do menu: liga ou desliga os avisos neste aparelho. Some onde o navegador não tem avisos. */
export function PushMenuItem() {
  const push = usePush();
  if (push.status !== "on" && push.status !== "off") return null;
  const on = push.status === "on";
  return (
    <button
      type="button"
      disabled={push.busy}
      onClick={() => (on ? push.disable() : push.enable()).catch(failed)}
      aria-pressed={on}
      className="nx-anim flex h-11 w-full items-center gap-2.5 rounded-xl px-2.5 text-[14px] font-medium text-text-primary transition-colors hover:bg-panel-hover disabled:opacity-60 md:h-9"
    >
      {on ? <Bell size={17} className="text-primary" data-gesture="ring" /> : <BellOff size={17} className="text-text-secondary" />}
      <span className="flex-1 text-left">Avisos</span>
      <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${on ? "bg-success/14 text-success-strong" : "bg-text-secondary/10 text-text-secondary"}`}>{on ? "ligados" : "desligados"}</span>
    </button>
  );
}
