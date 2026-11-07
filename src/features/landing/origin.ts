import { API_ORIGIN } from "../../api/instance";

/*
 * De onde veio quem abriu a bio (Etapa 14). Mesma lista em nexo-backend/src/domain/landing/origin.ts.
 * O link pode dizer (`?o=instagram`); sem isso, o navegador do app ou a página anterior dizem. Nada pessoal é guardado:
 * a origem vai só com a contagem da visita, do clique e da conversa.
 */
export const ORIGINS = ["instagram", "google", "qr", "anuncio", "whatsapp", "tiktok", "facebook", "indicacao", "direto"] as const;
export type Origin = (typeof ORIGINS)[number];

export const ORIGIN_LABELS: Record<Origin, string> = {
  instagram: "Instagram",
  google: "Google",
  qr: "QR Code",
  anuncio: "Anúncio",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  facebook: "Facebook",
  indicacao: "Indicação",
  direto: "Link direto",
};

const isOrigin = (v: unknown): v is Origin => (ORIGINS as readonly string[]).includes(v as string);

function detect(): Origin {
  const param = new URLSearchParams(window.location.search).get("o");
  if (isOrigin(param)) return param;
  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "tiktok";
  const ref = document.referrer;
  if (/(^|\.)google\./i.test(safeHost(ref))) return "google";
  if (/instagram\.com$/i.test(safeHost(ref))) return "instagram";
  if (/facebook\.com$/i.test(safeHost(ref))) return "facebook";
  return "direto";
}

function safeHost(url: string) {
  try {
    return url ? new URL(url).hostname : "";
  } catch {
    return "";
  }
}

/** A origem desta visita, a mesma até a pessoa fechar a aba (navegar dentro da bio não muda). */
export function visitOrigin(slug: string): Origin {
  const key = `nexo-origin:${slug}`;
  try {
    const saved = sessionStorage.getItem(key);
    if (isOrigin(saved)) return saved;
    const origin = detect();
    sessionStorage.setItem(key, origin);
    return origin;
  } catch {
    return detect();
  }
}

/** Conta a visita (uma por pessoa por dia, no servidor). Falha em silêncio: nunca atrapalha o visitante. */
export function trackVisit(slug: string) {
  try {
    void fetch(`${API_ORIGIN}/api/public/landing-pages/${encodeURIComponent(slug)}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: visitOrigin(slug) }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* sem rede: ignora */
  }
}

/** O link da bio marcado com a origem, para colar em cada canal. */
export const withOrigin = (url: string, origin: Origin) => `${url}${url.includes("?") ? "&" : "?"}o=${origin}`;
