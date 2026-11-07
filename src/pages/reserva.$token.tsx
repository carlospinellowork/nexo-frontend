import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_ORIGIN } from "../api/instance";
import { durationLabel, timeIn } from "../features/agenda/types";
import { Badge } from "../shared/components/ui/Badge";
import { Button } from "../shared/components/ui/Button";
import { SealPill } from "../shared/components/ui/NexoSeal";
import { Calendar, CheckCircle2, ChevronRight, Clock, Download, Loader2, X } from "../shared/icons";

const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? "https://nexo.app";

export const Route = createFileRoute("/reserva/$token")({
  component: BookingPage,
});

interface PublicBooking {
  business: string;
  serviceName: string;
  customerName: string;
  startsAt: string;
  endsAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  timeZone: string;
  canCancel: boolean;
}

const url = (token: string) => `${API_ORIGIN}/api/public/bookings/${encodeURIComponent(token)}`;
const googleDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function googleCalendar(b: PublicBooking) {
  const params = new URLSearchParams({ action: "TEMPLATE", text: [b.serviceName, b.business].filter(Boolean).join(" - "), dates: `${googleDate(b.startsAt)}/${googleDate(b.endsAt)}`, ctz: b.timeZone });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const STATUS = {
  PENDING: <Badge tone="warning">Esperando confirmação</Badge>,
  CONFIRMED: <Badge tone="success" icon={CheckCircle2}>Confirmada</Badge>,
  CANCELLED: <Badge tone="neutral">Cancelada</Badge>,
};

/** Página da reserva para o cliente: sem login, só com o link que ele recebeu ao reservar. */
function BookingPage() {
  const { token } = Route.useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["public-booking", token],
    queryFn: async () => {
      const res = await fetch(url(token));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as PublicBooking;
    },
    retry: false,
  });

  // O link é a chave da reserva: não entra em buscadores.
  useEffect(() => {
    document.title = "Sua reserva";
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex";
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  const cancel = async () => {
    if (!confirm("Cancelar esta reserva? O horário fica livre para outra pessoa.")) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`${url(token)}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { message?: string }).message ?? "");
      queryClient.setQueryData(["public-booking", token], (await res.json()) as PublicBooking);
    } catch (err) {
      setError((err instanceof Error && err.message) || "Não foi possível cancelar. Tente de novo.");
    } finally {
      setCancelling(false);
    }
  };

  const day = booking && new Date(booking.startsAt).toLocaleDateString("pt-BR", { timeZone: booking.timeZone, weekday: "long", day: "numeric", month: "long" });
  const minutes = booking && Math.round((Date.parse(booking.endsAt) - Date.parse(booking.startsAt)) / 60_000);
  const active = booking && booking.status !== "CANCELLED";

  return (
    <div className="flex min-h-dvh flex-col items-center bg-bg-start px-4 py-8 text-text-primary lg:justify-center">
      <main className="flex w-full max-w-md flex-1 flex-col gap-3 lg:max-w-3xl lg:flex-none">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}
        {(isError || (!isLoading && !booking)) && (
          <div className="rounded-2xl border border-border-ui/70 bg-panel p-6 text-center shadow-card">
            <h1 className="font-display text-[22px] font-bold tracking-tight">Reserva não encontrada</h1>
            <p className="mt-2 text-[15px] text-text-secondary">Confira o link que você recebeu. Reservas antigas são apagadas depois de um tempo.</p>
          </div>
        )}
        {booking && (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-4">
            <section className="flex flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-5 shadow-card lg:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-text-secondary">{booking.business || "Sua reserva"}</span>
                {STATUS[booking.status]}
              </div>
              <h1 className={`font-display text-[26px] font-bold leading-tight tracking-tight lg:text-[32px] ${active ? "" : "line-through opacity-60"}`}>{booking.serviceName}</h1>
              <p className="flex items-center gap-2 text-[16px] font-semibold first-letter:uppercase">
                <Calendar size={18} className="shrink-0 text-primary" />
                <span className="first-letter:uppercase">{day}</span>
              </p>
              <p className="flex items-center gap-2 text-[16px] font-semibold tabular-nums">
                <Clock size={18} className="shrink-0 text-primary" />
                {timeIn(booking.startsAt, booking.timeZone)}
                <span className="font-normal text-text-secondary">({durationLabel(minutes ?? 0)})</span>
              </p>
              <p className="text-[14px] text-text-secondary">Em nome de {booking.customerName}</p>
            </section>

            <div className="flex flex-col gap-3">
            {active && (
              <section className="flex flex-col gap-2">
                <a href={googleCalendar(booking)} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-ui bg-panel text-[15px] font-semibold hover:bg-panel-hover">
                  <Calendar size={18} /> Adicionar ao Google Agenda
                </a>
                <a href={`${url(token)}/calendar.ics`} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-ui bg-panel text-[15px] font-semibold hover:bg-panel-hover">
                  <Download size={18} /> Adicionar ao iPhone e outros
                </a>
              </section>
            )}

            {error && (
              <p role="alert" className="rounded-2xl bg-danger/12 p-3 text-[14px] font-semibold text-danger-strong">
                {error}
              </p>
            )}
            {booking.canCancel && (
              <Button variant="ghost" icon={X} className="h-12" loading={cancelling} onClick={() => void cancel()}>
                Cancelar reserva
              </Button>
            )}
            {!active && <p className="text-center text-[14px] text-text-secondary lg:text-left">Esta reserva foi cancelada. Para marcar de novo, volte ao link do negócio.</p>}
            </div>
          </div>
        )}
      </main>
      <div className="mt-8 flex flex-col items-center gap-2">
        {/* Crescimento embutido (Etapa 17): quem marcou pelo link conhece o Nexo, e o cadastro conta como vindo da reserva. */}
        <a
          href={`${SITE_URL}/?via=reserva`}
          target="_blank"
          rel="noopener"
          className="mb-2 flex w-full max-w-md items-center gap-3 rounded-2xl border border-border-ui bg-panel px-4 py-3 text-left shadow-card transition-colors hover:bg-panel-hover"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[14px] font-semibold text-text-primary">Tem um negócio? Receba reservas assim também.</span>
            <span className="text-[12.5px] text-text-secondary">Crie a sua agenda e a sua bio no Nexo, grátis.</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-secondary" />
        </a>
        <SealPill href={`${SITE_URL}/?via=reserva`} />
        <a href="/privacidade" target="_blank" rel="noopener" className="inline-flex min-h-8 items-center px-2 text-[12px] text-text-secondary underline-offset-2 hover:underline">
          Privacidade
        </a>
      </div>
    </div>
  );
}
