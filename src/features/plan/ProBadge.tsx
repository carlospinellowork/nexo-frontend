import { useState } from "react";
import { Lock } from "../../shared/icons";
import { PlanSheet } from "./PlanSheet";

/** Selo "Pro" com cadeado. Na fase de testes avisa que está liberado; tocar explica o plano. */
export function ProBadge({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Recurso do plano Pro, liberado no período de testes"
        className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-accent/22 px-2.5 text-[12px] font-bold text-accent-strong hover:bg-accent/32 ${className}`}
      >
        <Lock size={12} /> Pro · liberado no teste
      </button>
      <PlanSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Cadeado pequeno, sem ação (dentro de links do menu, onde não cabe outro botão). */
export function ProLock() {
  return (
    <span aria-label="Pro" title="Pro: liberado no período de testes" className="inline-flex h-5 shrink-0 items-center gap-0.5 rounded-full bg-accent/22 px-1.5 text-[10.5px] font-bold text-accent-strong">
      <Lock size={10} /> Pro
    </span>
  );
}
