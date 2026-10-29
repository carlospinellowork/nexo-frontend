import { API_ORIGIN } from "../../api/instance";

/** Conta o clique em um item da página pública. Falhar em silêncio: nunca atrapalha o visitante. */
export function trackClick(slug: string, itemId: string) {
  try {
    void fetch(`${API_ORIGIN}/api/public/landing-pages/${encodeURIComponent(slug)}/clicks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* sem rede: ignora */
  }
}
