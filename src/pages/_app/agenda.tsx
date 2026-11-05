import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetAgenda } from "../../api/queries/useGetAgenda";
import { DesktopAgenda } from "../../features/agenda/DesktopAgenda";
import { HoursView } from "../../features/agenda/HoursView";
import { MobileAgenda } from "../../features/agenda/MobileAgenda";
import { ServicesView } from "../../features/agenda/ServicesView";
import { type CustomerNotice, MoveBookingSheet, NewBookingSheet, NotifyCustomerSheet } from "../../features/agenda/BookingSheets";
import { type Booking, dayIn } from "../../features/agenda/types";
import { Header } from "../../shared/components/layout/Header";
import { Segmented } from "../../shared/components/ui/Segmented";
import { useIsDesktop } from "../../shared/hooks/useIsDesktop";
import { useWorkspaceRole } from "../../shared/hooks/useWorkspaceRole";
import { Loader2 } from "../../shared/icons";

export const Route = createFileRoute("/_app/agenda")({
  // O aviso no celular abre direto no dia da reserva.
  validateSearch: (search: Record<string, unknown>): { dia?: string } => (typeof search.dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.dia) ? { dia: search.dia } : {}),
  component: AgendaPage,
});

const TABS = [
  { value: "dia", label: "Agenda" },
  { value: "servicos", label: "Serviços" },
  { value: "horarios", label: "Horários" },
] as const;

function AgendaPage() {
  const { dia } = Route.useSearch();
  const { data: agenda, isLoading } = useGetAgenda();
  const role = useWorkspaceRole();
  const [tab, setTab] = useState<"dia" | "servicos" | "horarios">("dia");
  const [picked, setPicked] = useState<string | null>(null);
  const canEdit = role.canManage;
  const desktop = useIsDesktop();
  const [creating, setCreating] = useState<{ date: string; time?: string } | null>(null);
  const [moving, setMoving] = useState<Booking | null>(null);
  const [notice, setNotice] = useState<CustomerNotice | null>(null);
  // Reserva marcada à mão pode não ter telefone: aí não há o que abrir.
  const notifyMoved = (booking: Booking) => booking.customerPhone && setNotice({ booking, kind: "moved" });
  const notifyCancelled = (booking: Booking) => booking.customerPhone && setNotice({ booking, kind: "cancelled" });
  const date = picked ?? dia ?? (agenda ? dayIn(agenda.config.timeZone) : "");

  return (
    <div className="flex h-full flex-col">
      <Header title="Agenda" subtitle="Quem vem, quando e o que você atende" actions={desktop ? <Segmented label="Parte da agenda" size="sm" value={tab} onChange={setTab} options={[...TABS]} /> : undefined} />
      <div className={`min-h-0 flex-1 ${desktop && tab === "dia" ? "overflow-hidden" : "overflow-y-auto"}`}>
        {isLoading || !agenda ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className={`mx-auto flex w-full flex-col gap-3 ${desktop ? (tab === "dia" ? "h-full max-w-none px-5 py-4" : "max-w-5xl px-6 py-5") : "max-w-xl px-3 py-4"}`}>
            {!desktop && <Segmented label="Parte da agenda" fullWidth value={tab} onChange={setTab} options={[...TABS]} />}
            {tab === "dia" &&
              (desktop ? (
                <DesktopAgenda agenda={agenda} date={date} onDate={setPicked} onSetup={() => setTab("servicos")} onNew={(d, time) => setCreating({ date: d, time })} onMove={setMoving} onMoved={notifyMoved} onCancelled={notifyCancelled} />
              ) : (
                <MobileAgenda agenda={agenda} date={date} onDate={setPicked} onSetup={() => setTab("servicos")} onNew={(d, time) => setCreating({ date: d, time })} onMove={setMoving} onCancelled={notifyCancelled} />
              ))}
            {tab === "servicos" && <ServicesView services={agenda.services} canEdit={canEdit} />}
            {tab === "horarios" && <HoursView key={agenda.config.workspaceId} agenda={agenda} canEdit={canEdit} />}
          </div>
        )}
      </div>
      {creating && agenda && <NewBookingSheet agenda={agenda} date={creating.date} time={creating.time} onClose={() => setCreating(null)} />}
      {moving && agenda && <MoveBookingSheet booking={moving} timeZone={agenda.config.timeZone} onClose={() => setMoving(null)} onMoved={notifyMoved} />}
      {notice && agenda && <NotifyCustomerSheet notice={notice} timeZone={agenda.config.timeZone} onClose={() => setNotice(null)} />}
    </div>
  );
}
