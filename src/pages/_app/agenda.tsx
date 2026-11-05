import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetAgenda } from "../../api/queries/useGetAgenda";
import { DayView } from "../../features/agenda/DayView";
import { HoursView } from "../../features/agenda/HoursView";
import { ServicesView } from "../../features/agenda/ServicesView";
import { dayIn } from "../../features/agenda/types";
import { Header } from "../../shared/components/layout/Header";
import { Segmented } from "../../shared/components/ui/Segmented";
import { useWorkspaceRole } from "../../shared/hooks/useWorkspaceRole";
import { Loader2 } from "../../shared/icons";

export const Route = createFileRoute("/_app/agenda")({
  // O aviso no celular abre direto no dia da reserva.
  validateSearch: (search: Record<string, unknown>): { dia?: string } => (typeof search.dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.dia) ? { dia: search.dia } : {}),
  component: AgendaPage,
});

const TABS = [
  { value: "dia", label: "Dia" },
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

  return (
    <div className="flex h-full flex-col">
      <Header title="Agenda" subtitle="Quem vem, quando e o que você atende" />
      <div className="flex-1 overflow-y-auto">
        {isLoading || !agenda ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-3 py-4 md:px-6 md:py-6">
            <Segmented label="Parte da agenda" fullWidth value={tab} onChange={setTab} options={[...TABS]} />
            {tab === "dia" && <DayView agenda={agenda} date={picked ?? dia ?? dayIn(agenda.config.timeZone)} onDate={setPicked} onSetup={() => setTab("servicos")} />}
            {tab === "servicos" && <ServicesView services={agenda.services} canEdit={canEdit} />}
            {tab === "horarios" && <HoursView key={agenda.config.workspaceId} agenda={agenda} canEdit={canEdit} />}
          </div>
        )}
      </div>
    </div>
  );
}
