import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useDeleteAgendaService, useSaveAgendaService } from "../../api/mutations/useAgendaMutations";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass, selectClass } from "../../shared/components/ui/styles";
import { Switch } from "../../shared/components/ui/Switch";
import { toast } from "../../shared/components/ui/toast-store";
import { Pencil, Plus, Trash2 } from "../../shared/icons";
import { type AgendaServiceItem, durationLabel } from "./types";

const DURATIONS = [15, 20, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240];

function ServiceSheet({ service, onClose }: { service: AgendaServiceItem | "new"; onClose: () => void }) {
  const editing = service === "new" ? null : service;
  const [name, setName] = useState(editing?.name ?? "");
  const [minutes, setMinutes] = useState(editing?.durationMinutes ?? 60);
  const { mutateAsync, isPending } = useSaveAgendaService();
  const options = DURATIONS.includes(minutes) ? DURATIONS : [...DURATIONS, minutes].sort((a, b) => a - b);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ id: editing?.id, name: name.trim(), durationMinutes: minutes });
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar o serviço."));
    }
  };

  return (
    <Sheet
      open
      title={editing ? "Editar serviço" : "Novo serviço"}
      onClose={onClose}
      busy={isPending}
      onSubmit={(e) => void submit(e)}
      footer={
        <Button type="submit" size="lg" className="w-full" loading={isPending} disabled={!name.trim()}>
          Salvar
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="service-name" className="text-[13px] font-semibold text-text-secondary">
            Nome
          </label>
          <input id="service-name" autoFocus className={`${inputClass} text-[16px] md:text-[14px]`} maxLength={60} value={name} placeholder="Ex.: Consulta, Corte, Aula" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="service-duration" className="text-[13px] font-semibold text-text-secondary">
            Quanto tempo leva
          </label>
          <select id="service-duration" className={selectClass} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {options.map((m) => (
              <option key={m} value={m}>
                {durationLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Sheet>
  );
}

export function ServicesView({ services, canEdit }: { services: AgendaServiceItem[]; canEdit: boolean }) {
  const [editing, setEditing] = useState<AgendaServiceItem | "new" | null>(null);
  const { mutateAsync: save } = useSaveAgendaService();
  const { mutateAsync: remove } = useDeleteAgendaService();

  const toggle = (s: AgendaServiceItem, active: boolean) => save({ id: s.id, active }).catch((err: unknown) => toast.error(apiErrorMessage(err, "Não foi possível atualizar o serviço.")));
  const del = (s: AgendaServiceItem) => {
    if (!confirm(`Apagar "${s.name}"? As reservas já feitas continuam na agenda.`)) return;
    remove(s.id).catch((err: unknown) => toast.error(apiErrorMessage(err, "Não foi possível apagar o serviço.")));
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {services.map((s) => (
          <li key={s.id} className="flex items-center gap-2 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card">
            <span className={`flex min-w-0 flex-1 flex-col ${s.active ? "" : "opacity-50"}`}>
              <span className="truncate text-[15px] font-semibold text-text-primary">{s.name}</span>
              <span className="text-[13px] text-text-secondary">{durationLabel(s.durationMinutes)}</span>
            </span>
            {canEdit && (
              <>
                <Switch checked={s.active} label={`Aceitar reservas de ${s.name}`} onChange={(active) => void toggle(s, active)} />
                <button type="button" aria-label={`Editar ${s.name}`} onClick={() => setEditing(s)} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
                  <Pencil size={16} />
                </button>
                <button type="button" aria-label={`Apagar ${s.name}`} onClick={() => del(s)} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/12 hover:text-danger">
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {!services.length && <p className="px-1 text-[14px] text-text-secondary">Nenhum serviço ainda.</p>}
      {canEdit && (
        <Button size="lg" variant="secondary" icon={Plus} onClick={() => setEditing("new")}>
          Adicionar serviço
        </Button>
      )}
      {editing && <ServiceSheet service={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
