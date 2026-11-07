import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useDeleteStaff, useSaveStaff } from "../../api/mutations/useAgendaMutations";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass } from "../../shared/components/ui/styles";
import { Switch } from "../../shared/components/ui/Switch";
import { toast } from "../../shared/components/ui/toast-store";
import { Check, Pencil, Plus, Trash2, Users } from "../../shared/icons";
import type { AgendaData, AgendaStaffMember, WorkingInterval } from "./types";
import { WeekHoursEditor } from "./WeekHours";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function StaffSheet({ agenda, member, onClose }: { agenda: AgendaData; member: AgendaStaffMember | "new"; onClose: () => void }) {
  const editing = member === "new" ? null : member;
  const [name, setName] = useState(editing?.name ?? "");
  const [allServices, setAllServices] = useState(!editing?.serviceIds.length);
  const [serviceIds, setServiceIds] = useState<string[]>(editing?.serviceIds ?? []);
  const [ownHours, setOwnHours] = useState(Boolean(editing?.hours));
  const [hours, setHours] = useState<WorkingInterval[]>(editing?.hours ?? agenda.config.hours);
  const { mutateAsync, isPending } = useSaveStaff();
  const toggleService = (id: string) => setServiceIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allServices && !serviceIds.length) return toast.error("Escolha ao menos um serviço, ou marque que faz todos.");
    try {
      await mutateAsync({ id: editing?.id, name: name.trim(), serviceIds: allServices ? [] : serviceIds, hours: ownHours ? hours : null });
      toast.success(editing ? "Pessoa atualizada." : `${name.trim()} entrou na agenda.`);
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Confira os dados e tente de novo."));
    }
  };

  return (
    <Sheet
      open
      title={editing ? `Editar ${editing.name}` : "Nova pessoa na equipe"}
      onClose={onClose}
      busy={isPending}
      width="lg"
      onSubmit={(e) => void submit(e)}
      footer={
        <Button type="submit" size="lg" className="w-full" loading={isPending} disabled={!name.trim()}>
          Salvar
        </Button>
      }
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-name" className="text-[13px] font-semibold text-text-secondary">
              Nome (o cliente vê na bio)
            </label>
            <input id="staff-name" autoFocus className={`${inputClass} text-[16px] md:text-[14px]`} maxLength={40} value={name} placeholder="Ex.: Ana, Dr. Paulo" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex flex-1 flex-col">
                <span className="text-[14px] font-semibold text-text-primary">Faz todos os serviços</span>
                <span className="text-[12.5px] text-text-secondary">Desligue para escolher só os que essa pessoa faz.</span>
              </span>
              <Switch checked={allServices} label="Faz todos os serviços" onChange={setAllServices} />
            </div>
            {!allServices && (
              <ul className="flex flex-col gap-1.5">
                {agenda.services.map((s) => {
                  const on = serviceIds.includes(s.id);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggleService(s.id)}
                        className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl border px-3 text-left text-[14px] font-medium transition-colors ${on ? "border-primary/40 bg-primary/8 text-text-primary" : "border-border-ui text-text-secondary hover:bg-panel-hover"}`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? "border-primary bg-primary text-white" : "border-border-ui"}`}>{on && <Check size={13} />}</span>
                        {s.name}
                      </button>
                    </li>
                  );
                })}
                {!agenda.services.length && <li className="text-[13px] text-text-secondary">Cadastre os serviços primeiro, na aba Serviços.</li>}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex flex-1 flex-col">
              <span className="text-[14px] font-semibold text-text-primary">Horário próprio</span>
              <span className="text-[12.5px] text-text-secondary">{ownHours ? "Os dias e horários em que essa pessoa atende." : "Desligado: segue o horário da agenda."}</span>
            </span>
            <Switch checked={ownHours} label="Horário próprio" onChange={setOwnHours} />
          </div>
          {ownHours && <WeekHoursEditor hours={hours} onChange={setHours} />}
        </div>
      </div>
    </Sheet>
  );
}

/** Equipe da agenda (Etapa 18): quem atende, o que faz e quando. Com 2 pessoas ou mais, a bio pergunta "Com quem?". */
export function StaffView({ agenda, canEdit }: { agenda: AgendaData; canEdit: boolean }) {
  const [editing, setEditing] = useState<AgendaStaffMember | "new" | null>(null);
  const { mutateAsync: save } = useSaveStaff();
  const { mutateAsync: remove } = useDeleteStaff();
  const serviceName = (id: string) => agenda.services.find((s) => s.id === id)?.name;
  const active = agenda.staff.filter((m) => m.active);

  const del = async (m: AgendaStaffMember) => {
    if (!confirm(`Tirar ${m.name} da agenda? As reservas já feitas continuam com o nome.`)) return;
    try {
      const after = await remove(m.id);
      toast.success(after.some((x) => x.id === m.id) ? `${m.name} saiu da agenda. As reservas marcadas continuam.` : `${m.name} saiu da equipe.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível tirar da agenda."));
    }
  };
  const reactivate = (m: AgendaStaffMember) => save({ id: m.id, active: true }).catch((err: unknown) => toast.error(apiErrorMessage(err, "Não foi possível voltar à agenda.")));

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/8 px-3.5 py-3 text-[14px] leading-snug text-text-primary">
        <Users size={18} className="mt-0.5 shrink-0 text-primary" />
        <span>
          {active.length >= 2
            ? "Na sua bio, o cliente escolhe com quem marcar, ou toca em Tanto faz e fica com quem estiver livre."
            : "Cadastre quem atende. Com duas pessoas ou mais, o cliente escolhe com quem marcar na sua bio, e cada uma tem os próprios horários livres."}
        </span>
      </p>
      <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
        {agenda.staff.map((m) => (
          <li key={m.id} className={`flex items-center gap-3 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card ${m.active ? "" : "opacity-60"}`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[14px] font-bold text-primary">{initials(m.name)}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[15px] font-semibold text-text-primary">
                {m.name}
                {!m.active && <span className="ml-2 rounded-full bg-text-secondary/12 px-2 py-px text-[11.5px] font-semibold text-text-secondary">fora da agenda</span>}
              </span>
              <span className="truncate text-[12.5px] text-text-secondary">{m.serviceIds.length ? m.serviceIds.map(serviceName).filter(Boolean).join(", ") : "Faz todos os serviços"}</span>
              <span className="text-[12.5px] text-text-secondary">{m.hours ? "Horário próprio" : "Horário da agenda"}</span>
            </span>
            {canEdit && (
              <>
                {!m.active && (
                  <Button size="sm" variant="ghost" onClick={() => void reactivate(m)}>
                    Voltar
                  </Button>
                )}
                <button type="button" aria-label={`Editar ${m.name}`} onClick={() => setEditing(m)} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
                  <Pencil size={16} />
                </button>
                {m.active && (
                  <button type="button" aria-label={`Tirar ${m.name} da agenda`} onClick={() => void del(m)} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/12 hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      {!agenda.staff.length && <p className="px-1 text-[14px] text-text-secondary">Ninguém na equipe ainda: a agenda funciona como de uma pessoa só.</p>}
      {canEdit && (
        <Button size="lg" variant="secondary" icon={Plus} className="lg:self-start" onClick={() => setEditing("new")}>
          Adicionar pessoa
        </Button>
      )}
      {editing && <StaffSheet agenda={agenda} member={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
