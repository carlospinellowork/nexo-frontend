export interface WorkingInterval {
  day: number;
  start: string;
  end: string;
}

export interface AgendaConfig {
  workspaceId: string;
  timeZone: string;
  hours: WorkingInterval[];
  autoConfirm: boolean;
  stepMinutes: number;
  minNoticeMinutes: number;
  horizonDays: number;
}

export interface AgendaServiceItem {
  id: string;
  name: string;
  durationMinutes: number;
  active: boolean;
  priceCents: number | null;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  iconMotion: string | null;
}

export interface AgendaBlock {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

export interface AgendaData {
  config: AgendaConfig;
  services: AgendaServiceItem[];
  blocks: AgendaBlock[];
}

export interface Booking {
  id: string;
  serviceName: string;
  priceCents: number | null;
  startsAt: string;
  endsAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  customerName: string;
  customerPhone: string;
  note: string | null;
}

export const dayIn = (timeZone: string, instant: Date = new Date()) => instant.toLocaleDateString("sv-SE", { timeZone });
export const shiftDay = (date: string, days: number) => new Date(Date.parse(`${date}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
export const longDay = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
export const shortDay = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" });
export const timeIn = (iso: string, timeZone: string) => new Date(iso).toLocaleTimeString("pt-BR", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** Link do WhatsApp do cliente. Número com DDD e sem DDI ganha o 55. */
export function whatsappOfCustomer(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
}

export const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: cents % 100 ? 2 : 0 });
/** Soma o previsto: canceladas não entram. Devolve 0 se ninguém cadastrou preço. */
export const revenueOf = (list: Booking[]) => list.reduce((sum, b) => sum + (b.status === "CANCELLED" ? 0 : (b.priceCents ?? 0)), 0);

export const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

export const durationLabel = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h}h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ");
};
