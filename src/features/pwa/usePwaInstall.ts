import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// O Android avisa uma vez, logo no começo: guardamos o evento fora do React para não perder.
let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * Instalar o Nexo como app. Android/Chrome: abre a instalação do sistema. iPhone: não existe esse botão no
 * Safari, então a tela mostra o passo a passo (Compartilhar > Adicionar à Tela de Início).
 */
export function usePwaInstall() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  const installed = isStandalone();
  const ios = isIos();
  return {
    /** Dá para oferecer a instalação (não está instalado e o aparelho permite). */
    available: !installed && (Boolean(deferred) || ios),
    installed,
    ios,
    install: async (): Promise<"prompted" | "ios"> => {
      if (deferred) {
        await deferred.prompt();
        await deferred.userChoice.catch(() => undefined);
        deferred = null;
        listeners.forEach((l) => l());
        return "prompted";
      }
      return "ios";
    },
  };
}
