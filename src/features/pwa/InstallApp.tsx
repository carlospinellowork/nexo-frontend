import { Download, Plus, Share, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { usePwaInstall } from "./usePwaInstall";

const DISMISS_KEY = "nexo-install-dismissed";

function IosSteps({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} title="Instalar o Nexo no iPhone" onClose={onClose} width="sm">
      <ol className="flex flex-col gap-3 text-[14.5px] text-text-primary">
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
            <Share size={18} />
          </span>
          <span>
            Toque em <b>Compartilhar</b>, na barra do Safari.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
            <Plus size={18} />
          </span>
          <span>
            Escolha <b>Adicionar à Tela de Início</b>.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
            <Smartphone size={18} />
          </span>
          <span>Abra o Nexo pelo ícone: ele abre em tela cheia, como um app.</span>
        </li>
      </ol>
    </Sheet>
  );
}

/** Item "Instalar o app" do menu (gaveta "Mais" no celular). Some quando já está instalado. */
export function InstallMenuItem({ onDone }: { onDone?: () => void }) {
  const pwa = usePwaInstall();
  const [steps, setSteps] = useState(false);
  if (!pwa.available) return null;
  return (
    <>
      <button
        type="button"
        onClick={async () => ((await pwa.install()) === "ios" ? setSteps(true) : onDone?.())}
        className="nx-anim flex h-11 w-full items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/8 px-2.5 text-[14px] font-semibold text-primary-strong"
      >
        <Download size={17} data-gesture="lift" /> Instalar o app
      </button>
      <IosSteps open={steps} onClose={() => setSteps(false)} />
    </>
  );
}

/** Cartão discreto no Início (só no celular), que pode ser dispensado. */
export function InstallCard() {
  const pwa = usePwaInstall();
  const [steps, setSteps] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  if (!pwa.available || dismissed) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* sem armazenamento: só esconde nesta visita */
    }
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-panel p-3 shadow-card md:hidden">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Smartphone size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14px] font-semibold text-text-primary">Nexo na tela inicial</span>
        <span className="text-[12.5px] text-text-secondary">Abre em tela cheia, como um app.</span>
      </span>
      <Button size="sm" onClick={async () => ((await pwa.install()) === "ios" ? setSteps(true) : undefined)}>
        Instalar
      </Button>
      <button type="button" onClick={dismiss} aria-label="Agora não" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
        <X size={16} />
      </button>
      <IosSteps open={steps} onClose={() => setSteps(false)} />
    </div>
  );
}
