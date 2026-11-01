import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { Check, Lock } from "../../shared/icons";
import { FREE_FOREVER, PRO_FEATURES, TRIAL } from "./plan";

/** O que é grátis para sempre e o que será Pro. */
export function PlanSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} title={TRIAL ? "Versão de teste" : "Planos"} onClose={onClose} width="sm" footer={<Button size="lg" className="w-full" onClick={onClose}>Entendi</Button>}>
      <div className="flex flex-col gap-5">
        {TRIAL && (
          <p className="rounded-2xl bg-primary/10 px-4 py-3 text-[14.5px] leading-snug text-text-primary">
            O Nexo está em testes: <b>tudo está liberado</b>, inclusive o que será do plano Pro. Use à vontade e conte o que achou em <b>Dar opinião</b>.
          </p>
        )}
        <section className="flex flex-col gap-2">
          <h3 className="text-[15px] font-bold text-text-primary">Grátis para sempre</h3>
          <ul className="flex flex-col gap-1.5">
            {FREE_FOREVER.map((f) => (
              <li key={f} className="flex gap-2 text-[14px] leading-snug text-text-secondary">
                <Check size={16} className="mt-0.5 shrink-0 text-success" /> {f}
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-text-primary">
            <Lock size={15} className="text-accent-strong" /> Plano Pro {TRIAL && <span className="text-[13px] font-semibold text-text-secondary">(liberado no teste)</span>}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {PRO_FEATURES.map((f) => (
              <li key={f.title} className="flex flex-col">
                <span className="text-[14px] font-semibold text-text-primary">{f.title}</span>
                <span className="text-[13px] leading-snug text-text-secondary">{f.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Sheet>
  );
}
