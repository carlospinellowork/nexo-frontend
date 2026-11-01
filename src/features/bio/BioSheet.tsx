import { X } from "../../shared/icons";
import { motion } from "motion/react";
import { type ReactNode, useEffect } from "react";

interface BioSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Painel de edição: sobe de baixo no celular e abre na lateral no computador (onde o celular de prévia continua clicável). */
export function BioSheet({ title, onClose, children, footer }: BioSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40 md:pointer-events-none md:items-start md:justify-end md:bg-transparent md:p-3" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full flex-col rounded-t-2xl border border-border-ui bg-panel shadow-float md:pointer-events-auto md:max-h-[calc(100dvh-24px)] md:w-[400px] md:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 py-1 pl-4 pr-1">
          <h2 className="truncate text-[17px] font-bold text-text-primary">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-panel-hover">
            <X size={20} />
          </button>
        </div>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">{children}</div>
        {footer && <div className="flex shrink-0 items-center gap-2 border-t border-border-ui p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </motion.div>
    </div>
  );
}
