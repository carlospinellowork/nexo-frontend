import { ChevronLeft, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type FormEvent, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Botão de voltar à esquerda do título (ex.: voltar à escolha do tipo). */
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Largura no computador: sm 380 · md 440 · lg 520 · xl 720. */
  width?: "sm" | "md" | "lg" | "xl";
  /** Com onSubmit, o painel vira um <form> (Enter envia; o botão do rodapé usa type="submit"). */
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  /** Bloqueia fechar (Esc, fundo, X) enquanto algo está sendo salvo. */
  busy?: boolean;
}

const WIDTHS = { sm: "md:w-[380px]", md: "md:w-[440px]", lg: "md:w-[520px]", xl: "md:w-[720px]" } as const;

/**
 * Modal do Nexo (único para o painel inteiro). No computador fica centralizado e tem a altura do
 * conteúdo, até 86% da tela; passou disso, só o meio rola e o cabeçalho e o rodapé ficam fixos.
 * No celular sobe de baixo (bottom sheet). Fecha com Esc, no X ou tocando fora.
 */
export function Sheet({ open, title, onClose, onBack, children, footer, width = "md", onSubmit, busy }: SheetProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(() => {});
  useEffect(() => {
    closeRef.current = () => !busy && onClose();
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

  const panelClass = `flex max-h-[90dvh] w-full flex-col rounded-t-2xl border border-border-ui bg-panel shadow-float outline-none md:max-h-[86dvh] md:rounded-2xl ${WIDTHS[width]}`;
  const motionProps = {
    tabIndex: -1,
    role: "dialog" as const,
    "aria-modal": true,
    "aria-label": title,
    initial: reduce ? { opacity: 0 } : { y: 28, opacity: 0, scale: 0.98 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: reduce ? { opacity: 0 } : { y: 16, opacity: 0, transition: { duration: 0.14 } },
    transition: { type: "spring" as const, stiffness: 420, damping: 34 },
    className: panelClass,
  };

  const content = (
    <>
      {/* Alça do bottom sheet, só no celular. */}
      <span className="mx-auto mt-1.5 h-1 w-9 shrink-0 rounded-full bg-text-secondary/25 md:hidden" aria-hidden />
      <div className="flex shrink-0 items-center gap-1 py-1 pl-1.5 pr-1">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Voltar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-text-secondary hover:bg-panel-hover">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <span className="w-2.5" />
        )}
        <h2 className="min-w-0 flex-1 truncate text-[16px] font-bold tracking-tight text-text-primary">{title}</h2>
        <button
          type="button"
          onClick={() => closeRef.current()}
          disabled={busy}
          aria-label="Fechar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-text-secondary hover:bg-panel-hover disabled:opacity-40"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-4 pt-1">{children}</div>
      {footer && (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-ui px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">{footer}</div>
      )}
    </>
  );

  // Portal no <body>: um pai com transform ou backdrop-filter (ex.: o menu em gaveta, de vidro) prenderia o
  // "fixed" dentro dele, e o painel abriria espremido.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 backdrop-blur-[3px] md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}
        >
          {onSubmit ? (
            <motion.form ref={panelRef as React.Ref<HTMLFormElement>} onSubmit={onSubmit} {...motionProps}>
              {content}
            </motion.form>
          ) : (
            <motion.div ref={panelRef as React.Ref<HTMLDivElement>} {...motionProps}>
              {content}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
