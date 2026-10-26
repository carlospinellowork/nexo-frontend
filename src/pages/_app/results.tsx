import { createFileRoute, Link } from "@tanstack/react-router";
import { ChartLine, CheckCircle2, Headset, Loader2, MessagesSquare, TriangleAlert, Users } from "lucide-react";
import { useState } from "react";
import { useGetResults } from "../../api/queries/useGetResults";
import { DailyBars } from "../../features/insights/DailyBars";
import { channelInfo } from "../../features/insights/channels";
import { Header } from "../../shared/components/layout/Header";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { Segmented } from "../../shared/components/ui/Segmented";

export const Route = createFileRoute("/_app/results")({
  component: ResultsPage,
});

const PERIODS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
] as const;

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-panel p-5 shadow-card">
      <span className="flex items-center gap-2 text-[13px] font-semibold text-text-secondary">
        <Icon size={16} />
        {label}
      </span>
      <span className="text-[32px] font-extrabold leading-none tracking-tight tabular-nums text-text-primary">{value}</span>
      {hint && <span className="text-[13px] text-text-secondary">{hint}</span>}
    </div>
  );
}

function ResultsPage() {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const { data, isLoading } = useGetResults(Number(period));
  const fmt = (n: number) => n.toLocaleString("pt-BR");
  const channels = Object.entries(data?.byChannel ?? {}).sort((a, b) => b[1] - a[1]);
  const maxChannel = Math.max(1, ...channels.map(([, n]) => n));

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Resultados"
        subtitle="Como os seus bots estão atendendo"
        actions={<Segmented label="Período" size="sm" value={period} onChange={setPeriod} options={[...PERIODS]} />}
      />
      <div className="flex-1 overflow-y-auto">
        {isLoading || !data ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : data.conversations === 0 ? (
          <EmptyState icon={ChartLine} title="Ainda sem conversas no período" description="Os números aparecem quando clientes conversarem com o bot no site, no WhatsApp, no Instagram ou no Telegram. O simulador não conta." />
        ) : (
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat icon={MessagesSquare} label="Conversas" value={fmt(data.conversations)} />
              <Stat icon={Users} label="Leads novos" value={fmt(data.leads)} hint="deixaram telefone ou e-mail" />
              <Stat
                icon={CheckCircle2}
                label="Chegaram ao fim"
                value={data.completionRate === null ? "—" : `${Math.round(data.completionRate * 100)}%`}
                hint="concluíram ou foram para a equipe"
              />
              <Stat icon={Headset} label="Transferidas" value={fmt(data.handoffs)} hint="o bot chamou a equipe" />
            </div>

            <section className="rounded-3xl bg-panel p-6 shadow-card">
              <h2 className="mb-4 text-[16px] font-bold tracking-tight text-text-primary">Conversas por dia</h2>
              <DailyBars data={data.perDay} label={`Conversas por dia nos últimos ${data.days} dias`} />
            </section>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <section className="rounded-3xl bg-panel p-6 shadow-card">
                <h2 className="text-[16px] font-bold tracking-tight text-text-primary">Onde as pessoas param</h2>
                <p className="mb-4 text-[13px] text-text-secondary">Bloco em que a conversa ficou parada por mais de 30 minutos sem terminar.</p>
                {!data.dropOff.length ? (
                  <p className="flex items-center gap-2 text-[14px] text-text-secondary">
                    <CheckCircle2 size={16} className="text-success" />
                    Ninguém desistiu no meio no período.
                  </p>
                ) : (
                  <ol className="flex flex-col gap-2">
                    {data.dropOff.map((d) => (
                      <li key={`${d.chat}-${d.nodeId}`} className="flex items-center gap-3 rounded-2xl bg-panel-2 px-3 py-2.5">
                        <TriangleAlert size={16} className="shrink-0 text-warning" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[14px] font-semibold text-text-primary">{d.label}</span>
                          <span className="truncate text-[12px] text-text-secondary">{d.chat}</span>
                        </span>
                        <span className="text-[14px] font-bold tabular-nums text-text-primary">{fmt(d.count)}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {data.dropOff.length > 0 && (
                  <Link to="/flow-builder" className="mt-3 inline-block text-[13px] font-semibold text-primary-strong hover:underline">
                    Ajustar o fluxo
                  </Link>
                )}
              </section>

              <section className="rounded-3xl bg-panel p-6 shadow-card">
                <h2 className="mb-4 text-[16px] font-bold tracking-tight text-text-primary">Conversas por canal</h2>
                <ul className="flex flex-col gap-3">
                  {channels.map(([channel, count]) => {
                    const info = channelInfo(channel);
                    return (
                      <li key={channel} className="flex flex-col gap-1.5">
                        <span className="flex items-center justify-between text-[14px]">
                          <span className="inline-flex items-center gap-2 font-medium text-text-primary">
                            <info.icon size={15} className="text-text-secondary" />
                            {info.label}
                          </span>
                          <span className="font-bold tabular-nums text-text-primary">{fmt(count)}</span>
                        </span>
                        <span className="h-2 overflow-hidden rounded-full bg-panel-2">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${(count / maxChannel) * 100}%` }} />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
