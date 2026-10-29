import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Bot, ExternalLink, Plus, RefreshCw, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useRegenerateBioBot } from "../../api/mutations/useBioMutations";
import { Button } from "../../shared/components/ui/Button";
import { inputClass, textareaClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { useFlowStore } from "../flow/store/flow.store";
import type { LandingPageRecord } from "../landing/contract";
import { AUDIENCE_PRESETS } from "./presets";

interface Row {
  key: string;
  id?: string;
  question: string;
  answer: string;
  hint?: string;
}

const newKey = () => crypto.randomUUID().slice(0, 6);

/** Aba "Perguntas do bot": edita as perguntas e respostas e gera o fluxo de novo. */
export function BioBotTab({ page, ensureSaved }: { page: LandingPageRecord; ensureSaved: () => Promise<boolean> }) {
  const navigate = useNavigate();
  const setSelectedChatId = useFlowStore((s) => s.setSelectedChatId);
  const { mutateAsync: regenerate, isPending } = useRegenerateBioBot();
  const saved = page.settings.bio?.faqs ?? [];
  const preset = AUDIENCE_PRESETS[page.settings.bio?.audience ?? "business"];
  const [rows, setRows] = useState<Row[]>(() => saved.map((f) => ({ key: f.id, ...f })));
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const filled = rows.filter((r) => r.question.trim() && r.answer.trim());
  const update = (key: string, patch: Partial<Row>) => setRows((all) => all.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const run = async (force: boolean) => {
    if (!(await ensureSaved())) return;
    try {
      const { aiUsed } = await regenerate({ pageId: page.id, force, faqs: filled.map((r) => ({ id: r.id, question: r.question.trim(), answer: r.answer.trim() })) });
      setNeedsConfirm(false);
      toast.success(aiUsed ? "Bot atualizado, já com a IA respondendo com base nas suas respostas." : "Bot atualizado e no ar.");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409 && (err.response.data as { details?: { code?: string } })?.details?.code === "FLOW_EDITED") {
        setNeedsConfirm(true);
        return;
      }
      toast.error(apiErrorMessage(err, "Não foi possível atualizar o bot."));
    }
  };

  const openAdvanced = () => {
    if (page.chatId) setSelectedChatId(page.chatId);
    void navigate({ to: "/flow-builder" });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="flex gap-2 text-[13px] leading-snug text-text-secondary">
        <Bot size={16} className="mt-px shrink-0 text-primary" />O bot da sua bio responde com estas perguntas. Ao atualizar, o Nexo cria o fluxo de novo e publica na hora.
      </p>
      {!page.chat && <p className="rounded-2xl bg-warning/14 p-3 text-[13px] leading-snug text-warning-strong">Esta bio ainda não tem bot. Ao atualizar, o Nexo cria um e vincula à página.</p>}

      {rows.map((r, i) => (
        <div key={r.key} className="flex flex-col gap-2 rounded-2xl border border-border-ui bg-panel-2/60 p-3">
          <div className="flex items-center gap-1">
            <input aria-label={`Pergunta ${i + 1}`} className={inputClass} value={r.question} maxLength={120} placeholder="Pergunta" onChange={(e) => update(r.key, { question: e.target.value })} />
            <button type="button" aria-label={`Remover pergunta ${i + 1}`} onClick={() => setRows((all) => all.filter((x) => x.key !== r.key))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-danger/12 hover:text-danger">
              <X size={18} />
            </button>
          </div>
          <textarea aria-label={`Resposta ${i + 1}`} className={`${textareaClass} min-h-20`} value={r.answer} maxLength={600} placeholder={r.hint ? `Ex.: ${r.hint}` : "Resposta"} onChange={(e) => update(r.key, { answer: e.target.value })} />
        </div>
      ))}

      {rows.length < 8 && (
        <div className="flex flex-wrap gap-2">
          {preset.suggestions
            .filter((x) => !rows.some((r) => r.question === x.question))
            .slice(0, 3)
            .map((x) => (
              <button key={x.question} type="button" onClick={() => setRows((all) => [...all, { key: newKey(), question: x.question, answer: "", hint: x.hint }])} className="flex min-h-11 items-center gap-1.5 rounded-full border border-border-ui bg-panel-2 px-3.5 text-left text-[14px] font-medium text-text-primary hover:bg-panel-hover">
                <Plus size={14} className="shrink-0 text-primary" />
                {x.question}
              </button>
            ))}
          <button type="button" onClick={() => setRows((all) => [...all, { key: newKey(), question: "", answer: "" }])} className="flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-border-ui px-3.5 text-[14px] font-semibold text-primary-strong">
            <Plus size={14} /> Outra pergunta
          </button>
        </div>
      )}

      {needsConfirm && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl bg-warning/14 p-3 text-[13px] leading-snug text-warning-strong">
          <span className="flex gap-2">
            <TriangleAlert size={16} className="mt-px shrink-0" />O fluxo deste bot foi editado no construtor (ou montado à mão). Gerar de novo substitui essas edições.
          </span>
          <div className="flex flex-col gap-2 min-[420px]:flex-row">
            <Button variant="danger" onClick={() => void run(true)} loading={isPending} className="min-h-11 flex-1">
              Substituir mesmo assim
            </Button>
            <Button variant="outline" onClick={() => setNeedsConfirm(false)} className="min-h-11 flex-1">
              Manter como está
            </Button>
          </div>
        </div>
      )}

      <Button size="lg" icon={RefreshCw} onClick={() => void run(false)} loading={isPending && !needsConfirm} disabled={!filled.length || needsConfirm}>
        Atualizar o bot
      </Button>
      {page.chatId && (
        <button type="button" onClick={openAdvanced} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-[14px] font-semibold text-primary-strong hover:bg-primary/8">
          <ExternalLink size={15} /> Abrir no editor avançado
        </button>
      )}
    </div>
  );
}
