import { Globe, Instagram, Link, Link2, type LucideIcon, MessageCircle, Star, Wifi } from "lucide-react";

/**
 * QR Codes do workspace (espelho do formato de `nexo-backend/src/domain/qr/contract.ts` e do
 * `QrCodeService.toPanel`). Todos, menos o Wi-Fi, são dinâmicos: o QR guarda só o `scanUrl`
 * (/q/:code) e o destino pode mudar sem reimprimir.
 */
export const QR_KINDS = ["bio", "page", "whatsapp", "google_review", "instagram", "url", "wifi"] as const;
export type QrKind = (typeof QR_KINDS)[number];

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export interface QrTargets {
  bio: { pageId: string };
  page: { pageId: string };
  whatsapp: { phone: string; message?: string };
  google_review: { url: string };
  instagram: { username: string };
  url: { url: string };
  wifi: { ssid: string; security: WifiSecurity; password?: string; hidden?: boolean };
}

/** Na resposta, o Wi-Fi vem sem a senha e com `hasPassword`. */
export type QrWifiTargetOut = Omit<QrTargets["wifi"], "password"> & { hasPassword: boolean };

type QrTargetOut<K extends QrKind> = K extends "wifi" ? QrWifiTargetOut : QrTargets[K];

interface QrCodeBase<K extends QrKind> {
  id: string;
  code: string;
  kind: K;
  label: string;
  target: QrTargetOut<K>;
  page: { id: string; slug: string; title: string } | null;
  /** O que vai dentro do QR dinâmico. Null no Wi-Fi. */
  scanUrl: K extends "wifi" ? null : string;
  /** Para onde a leitura leva agora. Null no Wi-Fi ou quando a página foi apagada. */
  destination: string | null;
  stats: K extends "wifi" ? null : { last7: number; last30: number };
  createdAt: string;
  updatedAt: string;
}

export type QrCode = { [K in QrKind]: QrCodeBase<K> }[QrKind];

/** Corpo de POST e PUT /qr-codes. */
export type QrInput = { [K in QrKind]: { label: string; kind: K; target: QrTargets[K] } }[QrKind];

export const LABEL_MAX = 60;

export interface QrKindInfo {
  title: string;
  /** Explicação curta no seletor de tipo. */
  description: string;
  icon: LucideIcon;
  /** Nome sugerido quando a pessoa não dá um. */
  defaultLabel: string;
  /** Título sugerido do cartão para imprimir. */
  cardTitle: string;
}

export const QR_KIND_INFO: Record<QrKind, QrKindInfo> = {
  bio: { title: "Minha Bio", description: "Seus links e o assistente numa página só", icon: Link2, defaultLabel: "QR da Bio", cardTitle: "Conheça a gente: aponte a câmera" },
  page: { title: "Página", description: "Abre uma das suas landing pages", icon: Globe, defaultLabel: "QR da página", cardTitle: "Aponte a câmera e saiba mais" },
  whatsapp: { title: "WhatsApp", description: "Abre a conversa com a mensagem pronta", icon: MessageCircle, defaultLabel: "WhatsApp do balcão", cardTitle: "Fale com a gente no WhatsApp" },
  google_review: { title: "Avaliação no Google", description: "Pede uma avaliação no seu Perfil da Empresa", icon: Star, defaultLabel: "Avaliações no Google", cardTitle: "Avalie a gente no Google" },
  instagram: { title: "Instagram", description: "Abre o seu perfil para seguirem você", icon: Instagram, defaultLabel: "Instagram", cardTitle: "Siga a gente no Instagram" },
  url: { title: "Link", description: "Qualquer endereço https, como cardápio ou loja", icon: Link, defaultLabel: "Link", cardTitle: "Aponte a câmera do celular" },
  wifi: { title: "Wi-Fi", description: "Conecta na rede sem digitar a senha", icon: Wifi, defaultLabel: "Wi-Fi dos clientes", cardTitle: "Wi-Fi grátis: aponte a câmera" },
};

export const WIFI_SECURITY_LABEL: Record<WifiSecurity, string> = { WPA: "WPA/WPA2", WEP: "WEP", nopass: "Sem senha" };

/** Telefone para exibir: +55 (11) 99999-9999 quando é número do Brasil. */
export function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(d);
  if (m) return `+55 (${m[1]}) ${m[2]}-${m[3]}`;
  const local = /^(\d{2})(\d{4,5})(\d{4})$/.exec(d);
  return local ? `(${local[1]}) ${local[2]}-${local[3]}` : `+${d}`;
}

/** Destino em texto curto, para o cartão e o detalhe. */
export function destinationText(qr: QrCode): string {
  switch (qr.kind) {
    case "bio":
    case "page":
      return qr.page ? qr.page.title : "Página apagada: escolha outra";
    case "whatsapp":
      return formatPhone(qr.target.phone);
    case "instagram":
      return `@${qr.target.username}`;
    case "google_review":
    case "url":
      try {
        const u = new URL(qr.target.url);
        return `${u.hostname.replace(/^www\./, "")}${u.pathname === "/" ? "" : u.pathname}`;
      } catch {
        return qr.target.url;
      }
    case "wifi":
      return `Rede ${qr.target.ssid}`;
  }
}
