import { useState } from "react";
import { ChevronRight, FlaskConical } from "../../shared/icons";
import { PlanSheet } from "./PlanSheet";
import { useGetMe } from "../../api/queries/useGetMe";
import { TRIAL } from "./plan";

/** Faixa do Início: avisa que é a versão de teste e que tudo está liberado. */
export function TrialBanner() {
  const [open, setOpen] = useState(false);
  const { data: me } = useGetMe();
  // Some quando o servidor liga a cobrança (NEXO_BILLING=on).
  if (!TRIAL || me?.workspace.billing) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-primary/8 px-3.5 py-2.5 text-left transition-colors hover:bg-primary/12">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-primary">
          <FlaskConical size={18} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-semibold text-text-primary">Versão de teste</span>
          <span className="text-[12.5px] leading-snug text-text-secondary">Tudo liberado, inclusive o que será Pro.</span>
        </span>
        <span className="flex shrink-0 items-center text-[13px] font-semibold text-primary-strong">
          Saiba mais <ChevronRight size={15} />
        </span>
      </button>
      <PlanSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
