import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api, apiErrorMessage } from "../../api/instance";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";
import { Header } from "../../shared/components/layout/Header";
import { Button } from "../../shared/components/ui/Button";
import { Segmented } from "../../shared/components/ui/Segmented";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { useWorkspaceRole } from "../../shared/hooks/useWorkspaceRole";
import { Copy, Loader2, Trash2, UserPlus, Users } from "../../shared/icons";

export const Route = createFileRoute("/_app/acesso")({
  component: AccessPage,
});

type Role = "OWNER" | "ADMIN" | "MEMBER";
interface Member {
  userId: string;
  name: string | null;
  email: string;
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = { OWNER: "Dono", ADMIN: "Administrador", MEMBER: "Atendente" };
const ROLE_HINT: Record<Exclude<Role, "OWNER">, string> = {
  MEMBER: "Vê a agenda e os contatos, marca, confirma e remarca. Não muda serviços, bio nem configurações.",
  ADMIN: "Faz tudo o que o dono faz, menos apagar a conta e tirar outro administrador.",
};

/** Acesso à conta (Etapa 18): quem entra no painel do negócio e o convite por link. */
function AccessPage() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { canManage, role: myRole } = useWorkspaceRole();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["team", workspaceId],
    queryFn: async () => (await api.get<{ members: Member[]; pendingInvites: number }>("/team")).data,
    enabled: !!workspaceId,
  });
  const [inviting, setInviting] = useState(false);
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [link, setLink] = useState("");
  const create = useMutation({
    mutationFn: async () => (await api.post<{ url: string }>("/team/invites", { role })).data,
    onSuccess: (r) => {
      setLink(r.url);
      return queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });
  const remove = useMutation({
    mutationFn: (userId: string) => api.delete(`/team/members/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team"] }),
  });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado. Mande para quem vai entrar.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie à mão.");
    }
  };
  const close = () => {
    setInviting(false);
    setLink("");
  };
  const del = (m: Member) => {
    if (!confirm(`Tirar o acesso de ${m.name || m.email}?`)) return;
    remove.mutate(m.userId, { onError: (err) => toast.error(apiErrorMessage(err, "Não foi possível tirar o acesso.")) });
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Acesso à conta"
        subtitle="Quem da sua equipe entra no painel do negócio"
        actions={
          canManage ? (
            <Button icon={UserPlus} onClick={() => setInviting(true)}>
              Convidar
            </Button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 py-4 md:px-6 md:py-6">
          <p className="flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/8 px-3.5 py-3 text-[14px] leading-snug text-text-primary">
            <Users size={18} className="mt-0.5 shrink-0 text-primary" />
            <span>Cada pessoa entra com o próprio e-mail e senha. Para aparecer na agenda e receber reservas, cadastre também em Agenda, aba Equipe.</span>
          </p>
          {isLoading ? (
            <Loader2 className="mx-auto mt-8 animate-spin text-primary" />
          ) : (
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {data?.members.map((m) => (
                <li key={m.userId} className="flex items-center gap-3 rounded-2xl border border-border-ui/70 bg-panel p-3 shadow-card">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] font-semibold text-text-primary">{m.name || m.email}</span>
                    <span className="truncate text-[12.5px] text-text-secondary">{m.email}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-semibold text-primary-strong">{ROLE_LABEL[m.role]}</span>
                  {canManage && m.role !== "OWNER" && (m.role === "MEMBER" || myRole === "OWNER") && (
                    <button type="button" aria-label={`Tirar o acesso de ${m.name || m.email}`} onClick={() => del(m)} className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/12 hover:text-danger">
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!!data?.pendingInvites && <p className="px-1 text-[13px] text-text-secondary">{data.pendingInvites === 1 ? "1 convite ainda não usado." : `${data.pendingInvites} convites ainda não usados.`} Cada link vale por 7 dias e uma vez só.</p>}
        </div>
      </div>

      <Sheet
        open={inviting}
        title="Convidar para a conta"
        onClose={close}
        width="sm"
        footer={
          link ? (
            <Button size="lg" icon={Copy} className="w-full" onClick={() => void copy()}>
              Copiar o link
            </Button>
          ) : (
            <Button size="lg" className="w-full" loading={create.isPending} onClick={() => create.mutate(undefined, { onError: (err) => toast.error(apiErrorMessage(err, "Não foi possível criar o convite.")) })}>
              Criar link de convite
            </Button>
          )
        }
      >
        {link ? (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] leading-snug text-text-secondary">Mande este link só para quem vai entrar, pelo WhatsApp por exemplo. Ele vale por 7 dias e uma vez só.</p>
            <input className={inputClass} readOnly value={link} aria-label="Link de convite" onFocus={(e) => e.target.select()} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Segmented label="Papel" fullWidth value={role} onChange={setRole} options={[{ value: "MEMBER", label: "Atendente" }, { value: "ADMIN", label: "Administrador" }]} />
            <p className="text-[14px] leading-snug text-text-secondary">{ROLE_HINT[role]}</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
