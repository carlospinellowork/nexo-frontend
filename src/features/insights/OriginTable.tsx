import type { OriginRow } from "../../api/queries/useGetResults";
import { type IconComponent, Facebook, Globe, Instagram, Link2, Music2, QrCode, Rocket, Search, Users, WhatsApp } from "../../shared/icons";
import { ORIGIN_LABELS, ORIGINS, type Origin } from "../landing/origin";

const ICONS: Record<Origin, IconComponent> = {
  instagram: Instagram,
  google: Search,
  qr: QrCode,
  anuncio: Rocket,
  whatsapp: WhatsApp,
  tiktok: Music2,
  facebook: Facebook,
  indicacao: Users,
  direto: Link2,
};

const asOrigin = (o: string): Origin => ((ORIGINS as readonly string[]).includes(o) ? (o as Origin) : "direto");
const fmt = (n: number) => n.toLocaleString("pt-BR");
const COLUMNS = [
  { key: "visits", label: "Visitas" },
  { key: "conversations", label: "Conversas" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "bookings", label: "Reservas" },
] as const;

/**
 * Clientes por origem (Etapa 14): de onde veio quem abriu a bio e o que cada canal trouxe. No computador, uma tabela com
 * barra das visitas; no celular, um cartão por origem.
 */
export function OriginTable({ rows }: { rows: OriginRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.visits));
  return (
    <section className="rounded-2xl border border-border-ui/70 bg-panel p-4 shadow-card">
      <h2 className="text-[16px] font-bold tracking-tight text-text-primary">Clientes por origem</h2>
      <p className="mb-4 text-[13px] text-text-secondary">De onde veio quem abriu a sua bio e o que cada canal trouxe. Use os links por canal da Minha Bio para separar melhor.</p>
      {!rows.length ? (
        <p className="flex items-center gap-2 text-[14px] text-text-secondary">
          <Globe size={16} className="text-primary" /> Ainda ninguém abriu a sua bio no período.
        </p>
      ) : (
        <>
          <table className="hidden w-full text-left text-[14px] md:table">
            <thead>
              <tr className="text-[12.5px] text-text-secondary">
                <th className="pb-2 font-semibold">Origem</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} className="pb-2 text-right font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const origin = asOrigin(r.origin);
                const Icon = ICONS[origin];
                return (
                  <tr key={r.origin} className="border-t border-border-ui/70">
                    <td className="py-2.5 pr-4">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon size={16} />
                        </span>
                        <span className="w-28 shrink-0 font-semibold text-text-primary">{ORIGIN_LABELS[origin]}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-text-secondary/10" aria-hidden>
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.visits / max) * 100}%` }} />
                        </span>
                      </span>
                    </td>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className="py-2.5 text-right font-display text-[16px] font-bold tabular-nums text-text-primary">
                        {fmt(r[c.key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ul className="flex flex-col gap-2 md:hidden">
            {rows.map((r) => {
              const origin = asOrigin(r.origin);
              const Icon = ICONS[origin];
              return (
                <li key={r.origin} className="flex flex-col gap-2 rounded-2xl bg-panel-2 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
                    <Icon size={16} className="text-primary" /> {ORIGIN_LABELS[origin]}
                  </span>
                  <dl className="grid grid-cols-4 gap-2">
                    {COLUMNS.map((c) => (
                      <div key={c.key} className="flex flex-col">
                        <dt className="text-[11.5px] text-text-secondary">{c.label}</dt>
                        <dd className="font-display text-[18px] font-bold tabular-nums text-text-primary">{fmt(r[c.key])}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
