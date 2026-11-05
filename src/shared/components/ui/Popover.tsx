import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  anchor: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  /** Largura mínima do painel; por padrão, a do campo. */
  minWidth?: number;
  label?: string;
  role?: string;
  /** "right": abre ao lado do campo, alinhado à base dele (menu da conta). */
  side?: "below" | "right";
  /** Tem itens que abrem modais: eles ficam por cima, e usá-los não fecha o painel. */
  opensDialogs?: boolean;
}

const GAP = 6;
const MARGIN = 8;

/**
 * Painel preso a um campo. Fica no <body>, acima dos modais, para nunca ser cortado por quem rola por dentro; abre
 * para cima quando não cabe embaixo. Esc fecha só ele, sem fechar o modal em volta.
 */
export function Popover({ anchor, onClose, children, minWidth, label, role, side = "below", opensDialogs = false }: PopoverProps) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number; up: boolean } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const box = anchor.current?.getBoundingClientRect();
      if (!box) return;
      const width = Math.min(Math.max(side === "right" ? 0 : box.width, minWidth ?? 0), window.innerWidth - MARGIN * 2);
      if (side === "right") {
        setPlace({ left: box.right + 20, bottom: window.innerHeight - box.bottom, width, maxHeight: window.innerHeight - MARGIN * 2, up: true });
        return;
      }
      const left = Math.min(Math.max(MARGIN, box.left), window.innerWidth - width - MARGIN);
      const below = window.innerHeight - box.bottom - GAP - MARGIN;
      const above = box.top - GAP - MARGIN;
      const wanted = panel.current?.scrollHeight ?? 320;
      // Prefere embaixo; só sobe se lá em cima couber mais do que aqui.
      const up = below < wanted && above > below;
      setPlace(up ? { left, bottom: window.innerHeight - box.top + GAP, width, maxHeight: above, up } : { left, top: box.bottom + GAP, width, maxHeight: below, up });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchor, minWidth, side]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (panel.current?.contains(target) || anchor.current?.contains(target)) return;
      if (opensDialogs && target.closest?.('[role="dialog"]')) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // O modal aberto a partir daqui fecha primeiro.
        if (opensDialogs && document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        e.stopPropagation();
        onClose();
        anchor.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [anchor, onClose, opensDialogs]);

  return createPortal(
    <motion.div
      ref={panel}
      role={role}
      aria-label={label}
      initial={reduce ? false : side === "right" ? { opacity: 0, x: -10, scale: 0.97 } : { opacity: 0, y: place?.up ? 6 : -6, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      style={place ? { position: "fixed", left: place.left, top: place.top, bottom: place.bottom, width: place.width, maxHeight: place.maxHeight, transformOrigin: side === "right" ? "bottom left" : place.up ? "bottom" : "top" } : { position: "fixed", visibility: "hidden" }}
      className={`${opensDialogs ? "z-[70]" : "z-[90]"} overflow-y-auto overscroll-contain rounded-2xl border border-border-ui bg-panel p-1 shadow-float`}
    >
      {children}
    </motion.div>,
    document.body,
  );
}
