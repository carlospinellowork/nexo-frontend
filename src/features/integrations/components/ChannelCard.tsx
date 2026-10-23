import { CheckCircle2, ChevronDown, Plug, TriangleAlert, Unplug } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../../api/instance";
import { useConnectIntegration } from "../../../api/mutations/useConnectIntegration";
import { useDeleteIntegration } from "../../../api/mutations/useDeleteIntegration";
import type { Integration } from "../../../api/queries/useGetIntegrations";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { inputClass } from "../../../shared/components/ui/styles";
import { toast } from "../../../shared/components/ui/toast-store";
import type { ChannelDefinition } from "../channels";

interface ChannelCardProps {
  channel: ChannelDefinition;
  chatId: string;
  integration?: Integration;
  /** motivo para o canal ainda não funcionar neste ambiente (ex.: sem HTTPS) */
  warning?: string;
}

export function ChannelCard({ channel, chatId, integration, warning }: ChannelCardProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const connect = useConnectIntegration();
  const remove = useDeleteIntegration();
  const Icon = channel.icon;

  const required = channel.fields.filter((f) => !f.optional);
  const canSubmit = required.every((f) => values[f.key]?.trim());

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await connect.mutateAsync({ chatId, type: channel.type, fields: values });
      setValues({});
      setExpanded(false);
      toast.success(`${channel.name} conectado: ${channel.describe(result.config) || result.name}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, `Não foi possível conectar o ${channel.name}.`));
    }
  };

  const disconnect = async () => {
    if (!integration || !window.confirm(`Desconectar ${channel.name}? O assistente para de responder nesse canal.`)) return;
    try {
      await remove.mutateAsync(integration.id);
      toast.success(`${channel.name} desconectado.`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <motion.div layout className="overflow-hidden rounded-3xl bg-panel shadow-card">
      <div className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-card" style={{ backgroundColor: channel.color }}>
          <Icon size={24} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-bold text-text-primary">{channel.name}</h3>
            {integration ? <Badge tone="success" icon={CheckCircle2}>Conectado</Badge> : <Badge>Desconectado</Badge>}
          </div>
          <p className="truncate text-[14px] text-text-secondary">
            {integration ? channel.describe(integration.config) || integration.name : channel.description}
          </p>
        </div>
        {integration ? (
          <Button variant="danger" size="sm" icon={Unplug} onClick={disconnect} loading={remove.isPending}>
            Desconectar
          </Button>
        ) : (
          <Button variant={expanded ? "ghost" : "secondary"} size="sm" icon={expanded ? undefined : Plug} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Cancelar" : "Conectar"}
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {!integration && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-border-ui p-5">
              {warning && (
                <p className="flex gap-2.5 rounded-2xl bg-warning/14 p-3.5 text-[13px] leading-snug text-warning-strong">
                  <TriangleAlert size={18} className="shrink-0" />
                  {warning}
                </p>
              )}

              <button type="button" onClick={() => setShowSteps((s) => !s)} className="flex w-fit items-center gap-1 text-[14px] font-semibold text-primary-strong">
                <ChevronDown size={16} className={`transition-transform ${showSteps ? "rotate-180" : ""}`} />
                Como conseguir os dados
              </button>
              <AnimatePresence initial={false}>
                {showSteps && (
                  <motion.ol
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex list-decimal flex-col gap-1.5 overflow-hidden rounded-2xl bg-panel-2 py-4 pl-9 pr-4 text-[14px] leading-snug text-text-secondary"
                  >
                    {channel.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </motion.ol>
                )}
              </AnimatePresence>

              <form onSubmit={submit} className="flex flex-col gap-4">
                {channel.fields.map((field) => (
                  <label key={field.key} className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-semibold text-text-secondary">
                      {field.label} {field.optional && <span className="font-normal opacity-70">(opcional)</span>}
                    </span>
                    <input
                      type={field.secret ? "password" : "text"}
                      autoComplete="off"
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className={`${inputClass} font-mono text-[14px]`}
                    />
                    {field.hint && <span className="text-[12px] leading-snug text-text-secondary">{field.hint}</span>}
                  </label>
                ))}
                <Button type="submit" icon={Plug} disabled={!canSubmit} loading={connect.isPending} className="self-start" style={{ backgroundColor: channel.color }}>
                  Conectar {channel.name}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
