import type { LinkItem, LinkKind } from "../landing/contract";

const DEFAULT_WHATSAPP_MESSAGE = "Oi! Vim pela sua bio e queria conversar.";

const newId = () => `lnk-${crypto.randomUUID().slice(0, 6)}`;

const waLink = (digits: string) => `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

const isHost = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

/** Reconhece um endereço ou número e devolve o item de link pronto (tipo, rótulo e endereço), ou null. */
export function recognizeLink(raw: string): LinkItem | null {
  const text = raw.trim().replace(/[),.;]+$/, "");
  if (!text) return null;

  // Número de telefone (com ou sem DDD, espaços, traços e +55).
  if (/^[+\d][\d\s().-]{9,19}$/.test(text)) {
    const digits = text.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 13) {
      return { id: newId(), kind: "whatsapp", label: "Falar no WhatsApp", url: waLink(digits), message: DEFAULT_WHATSAPP_MESSAGE };
    }
  }

  // @perfil sozinho: Instagram.
  const handle = text.match(/^@([A-Za-z0-9._]{2,30})$/);
  if (handle) return { id: newId(), kind: "instagram", label: "Instagram", url: `https://instagram.com/${handle[1]}` };

  let url = text;
  if (/^http:\/\//i.test(url)) url = url.replace(/^http:\/\//i, "https://");
  else if (!/^https:\/\//i.test(url)) url = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(url) ? `https://${url}` : "";
  if (!url) return null;
  const host = hostOf(url);
  if (!host || !host.includes(".")) return null;

  const make = (kind: LinkKind, label: string): LinkItem => ({ id: newId(), kind, label, url });

  if (isHost(host, "wa.me") || isHost(host, "whatsapp.com")) {
    const digits = (url.match(/wa\.me\/(\d+)/) ?? url.match(/phone=(\d+)/))?.[1];
    if (digits) return { id: newId(), kind: "whatsapp", label: "Falar no WhatsApp", url: `https://wa.me/${digits}`, message: DEFAULT_WHATSAPP_MESSAGE };
    return make("link", "WhatsApp");
  }
  if (isHost(host, "instagram.com")) return make("instagram", "Instagram");
  if (isHost(host, "tiktok.com")) return make("tiktok", "TikTok");
  if (isHost(host, "youtube.com") || isHost(host, "youtu.be")) return make("youtube", "YouTube");
  if (isHost(host, "mercadolivre.com.br") || isHost(host, "mercadolivre.com")) return make("link", "Mercado Livre");
  if (isHost(host, "shopee.com.br")) return make("link", "Shopee");
  if (isHost(host, "g.page") || isHost(host, "maps.app.goo.gl") || (isHost(host, "google.com") && /\/maps|review/.test(url))) return make("google", "Avaliar no Google");
  return make("site", host);
}

/** Separa o texto colado (linhas, vírgulas ou vários endereços numa linha) e reconhece cada pedaço. */
export function parseLinks(text: string): { found: LinkItem[]; unknown: string[] } {
  const found: LinkItem[] = [];
  const unknown: string[] = [];
  for (const line of text.split(/[\n;,]+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Vários endereços na mesma linha, separados por espaço (número de telefone fica inteiro).
    const pieces = /^[+\d]/.test(trimmed) ? [trimmed] : trimmed.split(/\s+/);
    for (const piece of pieces) {
      const link = recognizeLink(piece);
      if (link) found.push(link);
      else unknown.push(piece);
    }
  }
  return { found, unknown };
}
