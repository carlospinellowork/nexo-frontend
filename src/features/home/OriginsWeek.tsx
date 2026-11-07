import { Link } from "@tanstack/react-router";
import { useGetResults } from "../../api/queries/useGetResults";
import { ChevronRight, Globe } from "../../shared/icons";
import { ORIGIN_LABELS, ORIGINS, type Origin } from "../landing/origin";

const asOrigin = (o: string): Origin => ((ORIGINS as readonly string[]).includes(o) ? (o as Origin) : "direto");

/** De onde vieram os clientes na semana (Etapa 14), no Início. Só aparece quando alguém já abriu a bio. */
export function OriginsWeek() {
  const { data } = useGetResults(7);
  const rows = (data?.byOrigin ?? []).filter((r) => r.visits > 0).slice(0, 4);
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.visits));
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
          <Globe size={17} className="text-primary" /> De onde vieram nos últimos 7 dias
        </h2>
        <Link to="/results" className="flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-primary-strong hover:underline">
          Ver tudo <ChevronRight size={14} />
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {rows.map((r) => (
          <li key={r.origin} className="flex flex-col gap-1.5 rounded-xl bg-panel-2 px-3 py-2.5">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[13px] font-semibold text-text-secondary">{ORIGIN_LABELS[asOrigin(r.origin)]}</span>
              <span className="font-display text-[20px] font-bold tabular-nums text-text-primary">{r.visits}</span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-text-secondary/12" aria-hidden>
              <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.visits / max) * 100}%` }} />
            </span>
            <span className="text-[12px] text-text-secondary">{[r.bookings ? `${r.bookings} reserva${r.bookings > 1 ? "s" : ""}` : "", r.whatsapp ? `${r.whatsapp} no WhatsApp` : ""].filter(Boolean).join(" · ") || "visitas"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
