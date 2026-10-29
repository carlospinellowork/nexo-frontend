/** Links e produtos agendados (a página pública já vem filtrada do servidor; aqui é só o aviso no editor). */
export type ScheduleState = "active" | "scheduled" | "expired";

export function scheduleState(item: { startsAt?: string; endsAt?: string }, now = Date.now()): ScheduleState {
  if (item.startsAt && Date.parse(item.startsAt) > now) return "scheduled";
  if (item.endsAt && Date.parse(item.endsAt) <= now) return "expired";
  return "active";
}

/** ISO (UTC) para o valor de um input datetime-local (hora do navegador). */
export function toLocalInput(iso?: string): string {
  if (!iso || Number.isNaN(Date.parse(iso))) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const fromLocalInput = (value: string): string | undefined => (value ? new Date(value).toISOString() : undefined);

/** Normaliza para comparar: sem maiúsculas e sem acentos. */
export const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
