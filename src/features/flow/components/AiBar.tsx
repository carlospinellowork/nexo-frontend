import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { apiErrorMessage } from "../../../api/instance";
import { useAiEditFlow } from "../../../api/mutations/useAiEditFlow";
import { useGetAiStatus } from "../../../api/queries/useGetAiStatus";
import { toast } from "../../../shared/components/ui/toast-store";
import { useFlowStore } from "../store/flow.store";

const SUGGESTIONS = ["Pergunte o nome e o WhatsApp do cliente", "Adicione botões de Vendas e Suporte", "Fora do horário, avise que respondemos amanhã"];

/** "Peça uma mudança à IA": a IA devolve o fluxo alterado e o editor aplica (dá para desfazer). */
export function AiBar({ chatId }: { chatId: string }) {
  const { data: ai } = useGetAiStatus();
  const { mutateAsync, isPending } = useAiEditFlow();
  const [instruction, setInstruction] = useState("");
  const [focused, setFocused] = useState(false);
  const disabled = !ai?.configured;

  const submit = async (e?: FormEvent, text = instruction) => {
    e?.preventDefault();
    if (text.trim().length < 3 || isPending || disabled) return;
    const { nodes, edges, applyFlow } = useFlowStore.getState();
    try {
      const result = await mutateAsync({ chatId, instruction: text.trim(), nodes, edges });
      applyFlow(result.nodes, result.edges);
      setInstruction("");
      toast.success(`${result.summary} Salve para manter, ou desfaça com Ctrl+Z.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "A IA não conseguiu alterar o fluxo."));
    }
  };

  return (
    <div id="tour-flow-ai" className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center px-[260px]">
      <div className="pointer-events-auto flex w-full max-w-[620px] flex-col items-center gap-2">
        {focused && !disabled && !instruction && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void submit(undefined, s)}
                className="rounded-full border border-border-ui bg-panel px-3 py-1 text-[12.5px] font-medium text-text-secondary shadow-card hover:text-text-primary"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
        <form
          onSubmit={submit}
          title={disabled ? "A IA ainda não está configurada no servidor (NEXO_ANTHROPIC_API_KEY)" : undefined}
          className={`flex h-[52px] w-full items-center gap-2 rounded-full border bg-panel/95 pl-4 pr-1.5 shadow-float backdrop-blur-xl transition-colors ${
            focused ? "border-accent" : "border-border-ui"
          } ${disabled ? "opacity-60" : ""}`}
        >
          {isPending ? <Loader2 size={18} className="shrink-0 animate-spin text-accent" /> : <Sparkles size={18} className="shrink-0 text-accent" />}
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled || isPending}
            maxLength={1000}
            placeholder={disabled ? "IA indisponível neste servidor" : isPending ? "A IA está montando o fluxo..." : "Peça uma mudança à IA"}
            aria-label="Peça uma mudança à IA"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-secondary"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={disabled || isPending || instruction.trim().length < 3}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-opacity disabled:opacity-35"
            aria-label="Enviar pedido à IA"
          >
            <ArrowUp size={18} strokeWidth={2.6} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
