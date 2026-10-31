import { ChevronLeft, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Botão de voltar à esquerda do título (ex.: voltar à escolha do tipo). */
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Largura do painel no computador. */
  width?: "md" | "lg";
}

/**
 * Painel que sobe de baixo no celular (bottom sheet) e abre na lateral direita no computador,
 * com o fundo escurecido. Fecha com Esc ou tocando fora.
 */
export function Sheet({ open, title, onClose, onBack, children, footer, width = "md" }: SheetProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Foco no painel ao abrir e de volta ao botão de origem ao fechar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-[80] flex items-end bg-black/40 backdrop-blur-[2px] md:items-stretch md:justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className={`flex max-h-[92dvh] w-full flex-col rounded-t-3xl border border-border-ui bg-panel shadow-float outline-none md:m-3 md:max-h-none md:rounded-3xl ${
              width === "lg" ? "md:w-[520px]" : "md:w-[440px]"
            }`}
          >
            {/* Alça do bottom sheet, só no celular. */}
            <span className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-text-secondary/25 md:hidden" aria-hidden />
            <div className="flex shrink-0 items-center gap-1 border-b border-border-ui py-1 pl-2 pr-1">
              {onBack ? (
                <button type="button" onClick={onBack} aria-label="Voltar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-panel-hover">
                  <ChevronLeft size={22} />
                </button>
              ) : (
                <span className="w-2" />
              )}
              <h2 className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-tight text-text-primary">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-panel-hover">
                <X size={20} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 md:p-5">{children}</div>
            {footer && <div className="flex shrink-0 items-center gap-2 border-t border-border-ui p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
