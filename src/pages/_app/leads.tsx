import { createFileRoute } from "@tanstack/react-router";
import { Bot, CheckCircle2, Download, ExternalLink, Headset, Loader2, Mail, Phone, Search, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useDeleteLead, useExportLeads, useResolveHandoff } from "../../api/mutations/useLeadActions";
import { type Handoff, useGetHandoffs } from "../../api/queries/useGetHandoffs";
import { useGetLeads } from "../../api/queries/useGetLeads";
import { channelInfo, formatPhone, timeAgo } from "../../features/insights/channels";
import { Header } from "../../shared/components/layout/Header";
import { Badge } from "../../shared/components/ui/Badge";
import { Button, IconButton } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { inputClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";

export const Route = createFileRoute("/_app/leads")({
  component: LeadsPage,
});

function HandoffCard({ handoff }: { handoff: Handoff }) {
  const { mutate: resolve, isPending } = useResolveHandoff();
  const channel = channelInfo(handoff.channel);
  const lastUser = [...handoff.messages].reverse().find((m) => m.from === "user");
  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 rounded-2xl bg-panel-2 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/16 text-warning-strong">
          <Headset size={18} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold text-text-primary">{handoff.name || formatPhone(handoff.phone) || "Cliente sem nome"}</span>
          <span className="flex flex-wrap items-center gap-x-2 text-[13px] text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <channel.icon size={13} />
              {channel.label}
            </span>
            {handoff.chat && <span>{handoff.chat.name}</span>}
            <span>{timeAgo(handoff.since)}</span>
          </span>
        </div>
      </div>
      {lastUser && <p className="line-clamp-2 rounded-xl bg-panel px-3 py-2 text-[14px] text-text-primary">“{lastUser.text}”</p>}
      <div className="flex flex-wrap gap-2">
        {handoff.replyUrl ? (
          <a
            href={handoff.replyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-[13px] font-semibold text-white hover:brightness-110"
          >
            <ExternalLink size={14} />
            {handoff.replyUrl.includes("instagram") ? "Abrir o Direct" : "Responder no WhatsApp"}
          </a>
        ) : (
          <span className="text-[12px] text-text-secondary">Sem contato para responder fora do chat.</span>
        )}
        <Button
          size="sm"
          variant="outline"
          icon={CheckCircle2}
          loading={isPending}
          onClick={() => resolve(handoff.id, { onSuccess: () => toast.success("Marcada como resolvida."), onError: (e) => toast.error(apiErrorMessage(e)) })}
        >
          Resolvido
        </Button>
      </div>
    </motion.li>
  );
}

function LeadsPage() {
  const [q, setQ] = useState("");
  const { data: handoffs } = useGetHandoffs();
  const { data: leads, isLoading } = useGetLeads(q.trim());
  const { mutate: exportLeads, isPending: exporting } = useExportLeads();
  const { mutate: deleteLead } = useDeleteLead();

  const remove = (id: string, label: string) => {
    if (!window.confirm(`Apagar ${label} da lista? Use isto quando a pessoa pedir a exclusão dos dados.`)) return;
    deleteLead(id, { onSuccess: () => toast.success("Lead apagado."), onError: (e) => toast.error(apiErrorMessage(e)) });
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Leads"
        subtitle="Quem os seus bots atenderam e deixou um contato"
        actions={
          <Button
            variant="outline"
            icon={Download}
            loading={exporting}
            disabled={!leads?.length}
            onClick={() => exportLeads(undefined, { onError: (e) => toast.error(apiErrorMessage(e, "Não foi possível exportar.")) })}
          >
            Exportar planilha
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
          <section className="rounded-3xl bg-panel p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-[18px] font-bold tracking-tight text-text-primary">Esperando atendimento</h2>
              {!!handoffs?.length && <Badge tone="warning">{handoffs.length}</Badge>}
            </div>
            {!handoffs?.length ? (
              <p className="flex items-center gap-2 text-[14px] text-text-secondary">
                <CheckCircle2 size={16} className="text-success" />
                Nenhuma conversa esperando. Quando o bot chamar a equipe, ela aparece aqui.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {handoffs.map((h) => (
                  <HandoffCard key={h.id} handoff={h} />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl bg-panel p-6 shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[18px] font-bold tracking-tight text-text-primary">Contatos captados</h2>
              <label className="relative w-full max-w-xs">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input className={`${inputClass} h-10 pl-9 text-[14px]`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, telefone ou e-mail" aria-label="Buscar leads" />
              </label>
            </div>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : !leads?.length ? (
              q ? (
                <p className="py-10 text-center text-[14px] text-text-secondary">Nenhum lead encontrado para “{q}”.</p>
              ) : (
                <EmptyState icon={Users} title="Nenhum lead ainda" description="Quando alguém deixar telefone ou e-mail numa conversa (ou falar com você pelo WhatsApp), aparece aqui." />
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-border-ui text-[13px] text-text-secondary">
                      <th className="pb-2 pr-4 font-semibold">Nome</th>
                      <th className="pb-2 pr-4 font-semibold">Contato</th>
                      <th className="pb-2 pr-4 font-semibold">Origem</th>
                      <th className="pb-2 pr-4 font-semibold">Respostas</th>
                      <th className="pb-2 pr-4 font-semibold">Último contato</th>
                      <th className="pb-2" aria-label="Ações" />
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => {
                      const channel = channelInfo(lead.channel);
                      const answers = Object.entries(lead.data).filter(([k]) => !["nome", "name", "telefone", "email"].includes(k));
                      return (
                        <tr key={lead.id} className="border-b border-border-ui/60 align-top last:border-0">
                          <td className="py-3 pr-4 font-semibold text-text-primary">{lead.name || <span className="font-normal text-text-secondary">Sem nome</span>}</td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col gap-0.5 text-text-primary">
                              {lead.phone && (
                                <a href={`https://wa.me/${lead.phone.length <= 11 ? `55${lead.phone}` : lead.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary-strong">
                                  <Phone size={13} className="text-text-secondary" />
                                  {formatPhone(lead.phone)}
                                </a>
                              )}
                              {lead.email && (
                                <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-primary-strong">
                                  <Mail size={13} className="text-text-secondary" />
                                  {lead.email}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-text-secondary">
                            <span className="inline-flex items-center gap-1.5">
                              <channel.icon size={13} />
                              {channel.label}
                            </span>
                            {lead.chat && (
                              <span className="mt-0.5 flex items-center gap-1.5 text-[13px]">
                                <Bot size={13} />
                                {lead.chat.name}
                              </span>
                            )}
                          </td>
                          <td className="max-w-[260px] py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {answers.slice(0, 4).map(([k, v]) => (
                                <span key={k} className="max-w-full truncate rounded-lg bg-panel-2 px-2 py-0.5 text-[12px] text-text-secondary" title={`${k}: ${v}`}>
                                  {v}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-text-secondary">{timeAgo(lead.lastContactAt)}</td>
                          <td className="py-2 text-right">
                            <IconButton icon={Trash2} label={`Apagar ${lead.name || "lead"}`} size={34} className="hover:text-danger" onClick={() => remove(lead.id, lead.name || "este lead")} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
