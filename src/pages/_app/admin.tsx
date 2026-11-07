import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, KeyRound, Loader2, Minus, ShieldOff } from "../../shared/icons";
import { apiErrorMessage } from "../../api/instance";
import { useCreateResetLink } from "../../api/mutations/useCreateResetLink";
import { useGetMe } from "../../api/queries/useGetMe";
import { type AdminAccount, useGetAdminOverview } from "../../api/queries/useGetAdminOverview";
import { Header } from "../../shared/components/layout/Header";
import { Button } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";

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

/** Funil desde o cadastro, na ordem da jornada (Etapa 12.7). Cada etapa conta as contas que já chegaram a ela alguma vez. */
const STEPS: { key: string; label: string; done: (a: AdminAccount) => boolean }[] = [
  { key: "bio", label: "Bio no ar", done: (a) => a.funnel.bioPublished },
  { key: "visit", label: "Primeira visita", done: (a) => a.funnel.firstVisit },
  { key: "whatsapp", label: "Ida ao WhatsApp", done: (a) => a.funnel.firstWhatsapp },
  { key: "booking", label: "Reserva pela bio", done: (a) => a.funnel.firstBooking },
];

/** Barras do funil: quantas contas de fora chegaram a cada etapa e quantas pararam na anterior. */
function Funnel({ accounts }: { accounts: AdminAccount[] }) {
  const rows = [{ label: "Cadastro", count: accounts.length }, ...STEPS.map((s) => ({ label: s.label, count: accounts.filter(s.done).length }))];
  const total = Math.max(1, accounts.length);
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-4 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[16px] font-bold text-text-primary">Funil desde o cadastro</h2>
        <span className="text-[12.5px] text-text-secondary">Contas de fora; admin e demonstração não entram</span>
      </div>
      <ol className="flex flex-col gap-2.5">
        {rows.map((r, i) => {
          const lost = i > 0 ? rows[i - 1].count - r.count : 0;
          return (
            <li key={r.label} className="grid grid-cols-[120px_minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)_200px]">
              <span className="text-[13.5px] font-semibold text-text-primary">{r.label}</span>
              <span className="h-7 overflow-hidden rounded-lg bg-text-secondary/10">
                <span className="block h-full rounded-lg bg-primary transition-[width] duration-500" style={{ width: `${(r.count / total) * 100}%`, minWidth: r.count ? 8 : 0 }} />
              </span>
              <span className="flex items-baseline justify-end gap-2 tabular-nums">
                <span className="font-display text-[18px] font-bold text-text-primary">{r.count}</span>
                <span className="text-[12.5px] text-text-secondary">{Math.round((r.count / total) * 100)}%</span>
                {lost > 0 && <span className="hidden text-[12px] text-danger-strong md:inline">{lost} pararam antes</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border-ui pt-3">
        <span className="mr-1 text-[12.5px] font-semibold text-text-secondary">Como chegaram:</span>
        {VIAS.map((v) => (
          <span key={v.key} className="rounded-full bg-text-secondary/10 px-2.5 py-0.5 text-[12.5px] font-semibold tabular-nums text-text-primary">
            {v.label} {accounts.filter((a) => (a.signupVia ?? null) === v.key).length}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Crescimento embutido (Etapa 17): de onde veio cada cadastro. */
const VIAS: { key: AdminAccount["signupVia"]; label: string }[] = [
  { key: "selo", label: "Selo da bio" },
  { key: "reserva", label: "Página da reserva" },
  { key: "indicacao", label: "Indicação" },
  { key: "site", label: "Site" },
  { key: null, label: "Sem marca" },
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

/** Gera o link de redefinição para a conta e mostra para copiar: o Carlos manda pelo WhatsApp. */
function ResetLinkButton({ email }: { email: string }) {
  const create = useCreateResetLink();
  const [link, setLink] = useState("");

  const generate = () =>
    create.mutate(email, {
      onSuccess: setLink,
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie à mão.");
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" icon={KeyRound} loading={create.isPending} onClick={generate} className="self-start md:self-center">
        Link de senha
      </Button>
      <Sheet
        open={Boolean(link)}
        title="Link de redefinição de senha"
        onClose={() => setLink("")}
        footer={
          <div className="flex justify-end">
            <Button icon={Copy} onClick={copy}>
              Copiar o link
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[14px] text-text-secondary">
            Envie só para <strong className="font-semibold text-text-primary">{email}</strong>: quem abrir o link pode trocar a senha dessa conta. Ele vale por 1 hora e uma vez só.
          </p>
          <input className={inputClass} readOnly value={link} aria-label="Link de redefinição" onFocus={(e) => e.target.select()} />
        </div>
      </Sheet>
    </>
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
  const external = accounts.filter((a) => !a.internal);

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
            <Funnel accounts={external} />
            <p className="px-1 text-[12.5px] text-text-secondary">
              Nas contas abaixo, cliques, WhatsApp, QR e conversas são dos últimos 7 dias. Conversas do simulador não contam. Reservas apagadas depois de 90 dias saem do funil.
            </p>

            <section className="flex flex-col gap-2">
              {accounts.map((a) => (
                <article key={a.email} className="flex flex-col gap-2.5 rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card md:flex-row md:items-center md:gap-4">
                  <div className="flex min-w-0 flex-col md:w-64">
                    <span className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-text-primary">
                      {a.name || a.email}
                      {a.internal && <span className="rounded-full bg-text-secondary/12 px-1.5 text-[11px] font-semibold text-text-secondary">interna</span>}
                    </span>
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
                  <ResetLinkButton email={a.email} />
                </article>
              ))}
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-[16px] font-bold text-text-primary">Erros ({data?.errors.length ?? 0})</h2>
              <p className="px-1 text-[12.5px] text-text-secondary">O mesmo erro é agrupado. Ficam aqui por 30 dias, sem dados de quem estava usando.</p>
              {!data?.errors.length && <p className="px-1 text-[13.5px] text-text-secondary">Nenhum erro registrado.</p>}
              {data?.errors.map((e) => (
                <details key={e.id} className="rounded-2xl border border-border-ui/70 bg-panel p-3.5 shadow-card">
                  <summary className="cursor-pointer text-[14px] font-semibold text-text-primary">{e.message}</summary>
                  <p className="mt-1 text-[12.5px] text-text-secondary">
                    {e.source === "api" ? "API" : "Painel"} em {e.path || "—"} · {e.count}x · último {ago(e.lastSeenAt)}
                  </p>
                  {e.stack && <pre className="mt-2 overflow-x-auto rounded-xl bg-panel-2 p-2.5 text-[12px] text-text-secondary">{e.stack}</pre>}
                </details>
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

