import { Globe, Instagram, type LucideIcon, MessageCircle, Send } from "lucide-react";

/** Nome e ícone de cada canal de origem de uma conversa. */
export const CHANNEL_INFO: Record<string, { label: string; icon: LucideIcon }> = {
  web: { label: "Site", icon: Globe },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  instagram: { label: "Instagram", icon: Instagram },
  telegram: { label: "Telegram", icon: Send },
};

export const channelInfo = (channel: string) => CHANNEL_INFO[channel] ?? { label: channel, icon: Globe };

/** "há 5 min", "há 2 h", "ontem"... */
export function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

/** 5511912345678 -> (11) 91234-5678 */
export function formatPhone(phone: string | null) {
  if (!phone) return "";
  const d = phone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}
