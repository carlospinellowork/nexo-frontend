import { useEffect, useState } from "react";
import { api } from "../../api/instance";

/**
 * Avisos no celular. "needs-install": iPhone só recebe avisos com o Nexo instalado na tela de início.
 * O estado vive fora do React para o cartão do Início e o item do menu andarem juntos.
 */
export type PushStatus = "loading" | "unsupported" | "needs-install" | "denied" | "off" | "on";

let status: PushStatus = "loading";
const listeners = new Set<() => void>();
const setStatus = (next: PushStatus) => {
  status = next;
  listeners.forEach((l) => l());
};

const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const supported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** Registra o service worker (uma vez, ao abrir o painel). */
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => undefined);
}

let checked = false;
async function check() {
  if (checked) return;
  checked = true;
  if (!supported()) return setStatus(isIos() && !isStandalone() ? "needs-install" : "unsupported");
  if (Notification.permission === "denied") return setStatus("denied");
  try {
    const reg = await navigator.serviceWorker.ready;
    setStatus((await reg.pushManager.getSubscription()) ? "on" : "off");
  } catch {
    setStatus("unsupported");
  }
}

const toKey = (base64: string) => {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

export function usePush() {
  const [, force] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    void check();
    return () => void listeners.delete(l);
  }, []);

  /** Pede a permissão, inscreve o aparelho e o servidor manda o primeiro aviso. */
  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setStatus(permission === "denied" ? "denied" : "off");
      const reg = await navigator.serviceWorker.ready;
      const { data } = await api.get<{ publicKey: string }>("/push");
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(data.publicKey) }));
      await api.post("/push/subscriptions", sub.toJSON());
      setStatus("on");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete("/push/subscriptions", { data: { endpoint: sub.endpoint } }).catch(() => undefined);
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  };

  return { status, busy, enable, disable };
}
