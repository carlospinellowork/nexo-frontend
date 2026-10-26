import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, GitGraph, Loader2, Scissors, Sparkles } from "lucide-react";
import { useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { type ExampleResult, type ExampleTemplate, useCreateExample } from "../../api/mutations/useCreateExample";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "../../shared/components/ui/toast-store";
import { useFlowStore } from "../flow/store/flow.store";

const EXAMPLES: { key: ExampleTemplate; name: string; description: string; icon: typeof Scissors; tint: string }[] = [
  { key: "barbearia", name: "Barbearia", description: "Agenda corte e barba, mostra preços e chama o barbeiro.", icon: Scissors, tint: "bg-warning/16 text-warning-strong" },
  { key: "salao", name: "Salão de beleza", description: "Agenda cabelo e unhas, mostra preços e chama a equipe.", icon: Sparkles, tint: "bg-accent/14 text-accent-strong" },
];

/** Empresas de exemplo: criam um bot publicado e uma landing page no ar, prontos para testar e adaptar. */
export function ExampleCompanies() {
  const navigate = useNavigate();
  const setSelectedChatId = useFlowStore((s) => s.setSelectedChatId);
  const { mutateAsync, isPending, variables } = useCreateExample();
  const [created, setCreated] = useState<ExampleResult | null>(null);

  const create = async (key: ExampleTemplate) => {
    try {
      const result = await mutateAsync(key);
      setCreated(result);
      setSelectedChatId(result.chatId);
      toast.success(`${result.chatName} criada: bot publicado e página no ar.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar o exemplo."));
    }
  };

  return (
    <div className="rounded-3xl bg-panel p-6 shadow-card">
      <h2 className="text-[18px] font-bold text-text-primary">Empresas de exemplo</h2>
      <p className="mt-1 text-[14px] text-text-secondary">Veja um negócio completo funcionando no Nexo e use como ponto de partida.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.key}
            type="button"
            disabled={isPending}
            onClick={() => void create(ex.key)}
            className="flex items-center gap-3 rounded-2xl border border-border-ui bg-panel-2 p-3 text-left transition-colors hover:bg-panel-hover disabled:opacity-60"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ex.tint}`}>
              {isPending && variables === ex.key ? <Loader2 size={20} className="animate-spin" /> : <ex.icon size={20} />}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[15px] font-semibold text-text-primary">{ex.name}</span>
              <span className="text-[13px] leading-snug text-text-secondary">{ex.description}</span>
            </span>
          </button>
        ))}
      </div>

      {created && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-success/10 p-3">
          <span className="mr-auto text-[14px] font-semibold text-success-strong">{created.chatName} está pronta.</span>
          <Button size="sm" variant="secondary" icon={GitGraph} onClick={() => navigate({ to: "/flow-builder" })}>
            Ver o fluxo
          </Button>
          <a
            href={`/p/${created.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-[13px] font-semibold text-white"
          >
            <ExternalLink size={14} />
            Abrir a página
          </a>
        </div>
      )}
    </div>
  );
}
