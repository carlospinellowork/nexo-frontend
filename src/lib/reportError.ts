import { API_ORIGIN } from "../api/instance";

const IGNORED = /ResizeObserver|^Script error/;
const MAX_PER_PAGE_LOAD = 5;
const seen = new Set<string>();

/** Avisa o /admin de um erro no navegador. Nunca lança: avisar de um erro não pode criar outro. */
export function reportError(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (IGNORED.test(message) || seen.has(message) || seen.size >= MAX_PER_PAGE_LOAD) return;
  seen.add(message);
  void fetch(`${API_ORIGIN}/api/error-reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    keepalive: true,
    body: JSON.stringify({
      message: message.slice(0, 2000),
      // Só o caminho: a query pode ter segredos, como o token de redefinição de senha.
      path: window.location.pathname.slice(0, 500),
      stack: error instanceof Error ? error.stack?.slice(0, 8000) : undefined,
    }),
  }).catch(() => {});
}

export function watchUncaughtErrors() {
  window.addEventListener("error", (e) => reportError(e.error ?? e.message));
  window.addEventListener("unhandledrejection", (e) => reportError(e.reason));
}
