import { LayoutTemplate, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";
import type { CreateLandingPagePayload } from "../../../api/mutations/useCreateLandingPage";
import { useGetAiStatus } from "../../../api/queries/useGetAiStatus";
import { useGetChats } from "../../../api/queries/useGetChats";
import { Button } from "../../../shared/components/ui/Button";
import { Segmented } from "../../../shared/components/ui/Segmented";
import { inputClass, selectClass, textareaClass } from "../../../shared/components/ui/styles";
import type { LandingTheme } from "../contract";
import { ThemePicker } from "./ThemePicker";

interface CreatePageDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (payload: CreateLandingPagePayload) => void;
}

/** Nova página: a IA escreve a partir da descrição, ou começa pelo modelo. */
export function CreatePageDialog({ open, loading, onClose, onCreate }: CreatePageDialogProps) {
  const { data: ai } = useGetAiStatus();
  const { data: chats } = useGetChats();
  const aiOn = Boolean(ai?.configured);
  const [mode, setMode] = useState<"ai" | "template">("ai");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<LandingTheme>("modern-blue");
  const [chatId, setChatId] = useState("");

  const firstChatId = chats?.[0]?.id ?? "";
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setMode(aiOn ? "ai" : "template");
    setChatId(firstChatId);
  }, [open, aiOn, firstChatId]);

  const useAi = mode === "ai" && aiOn;
  const canSubmit = title.trim().length >= 2 && (!useAi || description.trim().length >= 10);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onCreate({ title: title.trim(), theme, chatId: chatId || null, ...(useAi ? { useAi: true, description: description.trim() } : {}) });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}
          onKeyDown={(e) => e.key === "Escape" && !loading && onClose()}
        >
          <motion.form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-page-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="flex max-h-[92vh] w-full max-w-xl flex-col gap-5 overflow-y-auto rounded-3xl bg-panel p-6 shadow-float"
          >
            <div className="flex items-center justify-between">
              <h2 id="create-page-title" className="text-xl font-bold tracking-tight text-text-primary">
                Nova landing page
              </h2>
              <button type="button" onClick={onClose} disabled={loading} className="rounded-lg p-1.5 text-text-secondary hover:bg-panel-hover" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <Segmented
              label="Como criar"
              fullWidth
              value={mode}
              onChange={setMode}
              options={[
                { value: "ai", label: "Escrita pela IA", icon: Sparkles },
                { value: "template", label: "Começar pelo modelo", icon: LayoutTemplate },
              ]}
            />
            {mode === "ai" && !aiOn && (
              <p className="rounded-2xl bg-warning/14 p-3 text-[13px] leading-snug text-warning-strong">
                A IA ainda não está ligada neste servidor. A página será criada pelo modelo, com textos para você trocar.
              </p>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-text-secondary">Nome da empresa</span>
              <input className={inputClass} value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Clínica Sorriso" />
            </label>

            {mode === "ai" && aiOn && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-text-secondary">O que a empresa faz</span>
                <textarea
                  className={`${textareaClass} h-32`}
                  value={description}
                  maxLength={1000}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Serviços, público, cidade, diferenciais e formas de atendimento. A IA usa só o que você escrever: não inventa números nem depoimentos."
                />
                <span className="text-[12px] text-text-secondary">{description.trim().length < 10 ? "Escreva pelo menos uma frase." : `${description.length}/1000`}</span>
              </label>
            )}

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-text-secondary">Tema</span>
              <ThemePicker value={theme} onChange={setTheme} />
            </div>

            {chats && chats.length > 0 && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-text-secondary">Bot que atende na página</span>
                <select className={selectClass} value={chatId} onChange={(e) => setChatId(e.target.value)}>
                  <option value="">Nenhum</option>
                  {chats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" icon={useAi ? Sparkles : LayoutTemplate} loading={loading} disabled={!canSubmit}>
                {loading && useAi ? "Escrevendo a página..." : "Criar página"}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
