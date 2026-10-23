import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useGetAiStatus } from "../../../api/queries/useGetAiStatus";
import { ADDABLE_BLOCKS, BLOCK_GROUPS } from "../catalog";
import type { NodeType } from "../contract";

interface AddBlockMenuProps {
  onPick: (type: NodeType) => void;
  onClose: () => void;
}

/** Menu do botão "+": escolhe o próximo bloco, que já entra ligado à saída. */
export function AddBlockMenu({ onPick, onClose }: AddBlockMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { data: ai } = useGetAiStatus();

  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as globalThis.Node) && onClose();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="nodrag nopan nowheel absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-border-ui bg-panel p-1.5 shadow-float"
      role="menu"
    >
      <div className="max-h-80 overflow-y-auto">
        {BLOCK_GROUPS.map((group) => (
          <div key={group} className="py-1">
            <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{group}</p>
            {ADDABLE_BLOCKS.filter((b) => b.group === group).map((b) => {
              const disabled = b.needsAi && ai && !ai.configured;
              return (
                <button
                  key={b.type}
                  role="menuitem"
                  disabled={disabled}
                  onClick={() => onPick(b.type)}
                  title={disabled ? "A IA ainda não está configurada no servidor" : b.description}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-panel-hover disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${b.color} 14%, transparent)`, color: b.color }}>
                    <b.icon size={15} strokeWidth={2.2} />
                  </span>
                  <span className="truncate text-[14px] font-medium text-text-primary">{b.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
