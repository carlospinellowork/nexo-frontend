import { motion } from "motion/react";

/** Chave liga/desliga no estilo iOS. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className={`flex h-[26px] w-[44px] shrink-0 items-center rounded-full p-[3px] transition-colors ${checked ? "justify-end bg-success" : "justify-start bg-text-secondary/30"}`}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 36 }} className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}
