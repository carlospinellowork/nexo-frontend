import { Check, Code2, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { API_ORIGIN } from "../../../api/instance";

/** Código que o cliente cola no site para exibir o widget. */
export function EmbedCode({ chatId }: { chatId: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${API_ORIGIN}/nexo-chat.js" data-id="${chatId}" async></script>`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-border-ui bg-[var(--nx-glass)] px-6 py-4 backdrop-blur-2xl">
      <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-text-secondary">
        <Code2 size={16} className="text-primary" />
        Instale no site: cole antes de &lt;/body&gt;
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-xl border border-border-ui bg-panel-2 px-3.5 py-2.5 font-mono text-[12px] text-text-primary">{snippet}</code>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={copy}
          className={`flex h-10 w-28 items-center justify-center gap-1.5 rounded-xl text-[14px] font-semibold transition-colors ${
            copied ? "bg-success/14 text-success-strong" : "bg-primary/12 text-primary-strong hover:bg-primary/18"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(copied)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-1.5">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copiado" : "Copiar"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
