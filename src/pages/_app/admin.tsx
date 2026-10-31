import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Minus, ShieldOff } from "lucide-react";
import { useGetMe } from "../../api/queries/useGetMe";
import { type AdminAccount, useGetAdminOverview } from "../../api/queries/useGetAdminOverview";
import { Header } from "../../shared/components/layout/Header";
import { EmptyState } from "../../shared/components/ui/EmptyState";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

const ago = (iso: string | null) => {
  if (!iso) return "nunca";
  const min = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (min < 60) return `há ${Math.max(1, min)} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
};

/** As etapas que importam na fase de testes, na ordem. */
const STEPS: { key: string; label: string; done: (a: AdminAccount) => boolean }[] = [
  { key: "onboarded", label: "Conheceu", done: (a) => a.onboarded },
  { key: "bio", label: "Bio no ar", done: (a) => a.bioPublished },
  { key: "clicks", label: "Cliques", done: (a) => a.clicks7 > 0 },
  { key: "whatsapp", label: "WhatsApp", done: (a) => a.whatsappClicks7 > 0 },
];

function Step({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${ok ? "bg-success/14 text-success-strong" : "bg-text-secondary/10 text-text-secondary"}`}>
      {ok ? <Check size={12} /> : <Minus size={12} />}
      {label}
    </span>
  );
}

function Num({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex flex-col">
      <span className="font-display text-[17px] font-bold tabular-nums text-text-primary">{value}</span>
      <span className="text-[11.5px] text-text-secondary">{label}</span>
    </span>
  );
}

/** Painel de acompanhamento da fase de testes: só para quem está em NEXO_ADMIN_EMAILS. */
function AdminPage() {
  const { data: me, isLoading: loadingMe } = useGetMe();
  const isAdmin = Boolean(me?.user.isAdmin);
  const { data, isLoading } = useGetAdminOverview(isAdmin);

  if (loadingMe) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) return <EmptyState icon={ShieldOff} title="Página não encontrada" description="Esta área não está disponível para a sua conta." />;

  const accounts = data?.accounts ?? [];
  const pct = (n: number) => (accounts.length ? `${Math.round((n / accounts.length) * 100)}%` : "0%");
  const funnel = STEPS.map((s) => ({ label: s.label, count: accounts.filter(s.done).length }));

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title="Acompanhamento" subtitle="Fase de testes: quem está usando e onde parou" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
              <div className="rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card">
                <span className="font-display text-[26px] font-bold tabular-nums">{accounts.length}</span>
                <p className="text-[12.5px] text-text-secondary">contas</p>
              </div>
              {funnel.map((f) => (
                <div key={f.label} className="rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card">
                  <span className="font-display text-[26px] font-bold tabular-nums">{pct(f.count)}</span>
                  <p className="text-[12.5px] text-text-secondary">
                    {f.label} ({f.count})
                  </p>
                </div>
              ))}
            </section>
            <p className="px-1 text-[12.5px] text-text-secondary">Cliques, WhatsApp, QR e conversas: últimos 7 dias. Conversas do simulador não contam.</p>

            <section className="flex flex-col gap-2">
              {accounts.map((a) => (
                <article key={a.email} className="flex flex-col gap-2.5 rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card md:flex-row md:items-center md:gap-4">
                  <div className="flex min-w-0 flex-col md:w-64">
                    <span className="truncate text-[14px] font-semibold text-text-primary">{a.name || a.email}</span>
                    <span className="truncate text-[12.5px] text-text-secondary">
                      {a.email} · {a.workspace}
                    </span>
                    <span className="text-[12px] text-text-secondary">Último acesso {ago(a.lastSeenAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:w-72">
                    {STEPS.map((s) => (
                      <Step key={s.key} ok={s.done(a)} label={s.label} />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-2.5 md:flex-1 md:grid-cols-6">
                    <Num label="cliques" value={a.clicks7} />
                    <Num label="WhatsApp" value={a.whatsappClicks7} />
                    <Num label="QR" value={a.qrReads7} />
                    <Num label="conversas" value={a.conversations7} />
                    <Num label="leads" value={a.leads} />
                    <Num label="bots" value={a.bots} />
                  </div>
                </article>
              ))}
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-[16px] font-bold text-text-primary">Opiniões ({data?.feedback.length ?? 0})</h2>
              {!data?.feedback.length && <p className="px-1 text-[13.5px] text-text-secondary">Ainda ninguém mandou opinião pelo botão "Dar opinião".</p>}
              {data?.feedback.map((f) => (
                <article key={f.id} className="flex flex-col gap-1 rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card">
                  <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-text-secondary">
                    {f.rating && <span className="rounded-full bg-primary/12 px-2 py-0.5 font-bold text-primary-strong">{f.rating}/5</span>}
                    <span className="font-semibold text-text-primary">{f.user.name || f.user.email}</span>
                    <span>em {f.page || "—"}</span>
                    <span>· {ago(f.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text-primary">{f.message}</p>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

