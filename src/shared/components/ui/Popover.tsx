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
}

const GAP = 6;
const MARGIN = 8;

/**
 * Painel preso a um campo. Fica no <body>, acima dos modais, para nunca ser cortado por quem rola por dentro; abre
 * para cima quando não cabe embaixo. Esc fecha só ele, sem fechar o modal em volta.
 */
export function Popover({ anchor, onClose, children, minWidth, label, role }: PopoverProps) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number; up: boolean } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const box = anchor.current?.getBoundingClientRect();
      if (!box) return;
      const width = Math.min(Math.max(box.width, minWidth ?? 0), window.innerWidth - MARGIN * 2);
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
  }, [anchor, minWidth]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !anchor.current?.contains(target)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
  }, [anchor, onClose]);

  return createPortal(
    <motion.div
      ref={panel}
      role={role}
      aria-label={label}
      initial={reduce ? false : { opacity: 0, y: place?.up ? 6 : -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      style={place ? { position: "fixed", left: place.left, top: place.top, bottom: place.bottom, width: place.width, maxHeight: place.maxHeight, transformOrigin: place.up ? "bottom" : "top" } : { position: "fixed", visibility: "hidden" }}
      className="z-[90] overflow-y-auto overscroll-contain rounded-2xl border border-border-ui bg-panel p-1 shadow-float"
    >
      {children}
    </motion.div>,
    document.body,
  );
}
