import { CheckCircle2, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useToastStore } from "./toast-store";

export function Toaster() {
  const { items, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-border-ui bg-panel/90 px-4 py-3 text-[14px] shadow-float backdrop-blur-xl"
          >
            {t.kind === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
            )}
            <p className="flex-1 whitespace-pre-line text-text-primary">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-text-secondary hover:text-text-primary" aria-label="Fechar aviso">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
