import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { Check, Lock } from "../../shared/icons";
import { FREE_PLAN, PAID_PLANS, type PlanInfo, TRIAL } from "./plan";

function Soon() {
  return <span className="ml-1.5 inline-block whitespace-nowrap rounded-full bg-panel-hover px-2 py-px align-middle text-[11px] font-bold text-text-secondary">em breve</span>;
}

function PlanHeader({ plan, locked }: { plan: PlanInfo; locked?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-text-primary">
        {locked && <Lock size={15} className="text-accent-strong" />}
        {plan.name}
        <span className="text-[14px] font-semibold text-text-secondary">· {plan.price}</span>
        {plan.soon && <Soon />}
      </h3>
      {plan.notes.map((n) => (
        <span key={n} className="text-[12.5px] leading-snug text-text-secondary">
          {n}
        </span>
      ))}
    </div>
  );
}

/** Os três planos, iguais aos do site. Na fase de testes, avisa que tudo está liberado. */
export function PlanSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} title={TRIAL ? "Versão de teste" : "Planos"} onClose={onClose} width="sm" footer={<Button size="lg" className="w-full" onClick={onClose}>Entendi</Button>}>
      <div className="flex flex-col gap-5">
        {TRIAL && (
          <p className="rounded-2xl bg-primary/10 px-4 py-3 text-[14.5px] leading-snug text-text-primary">
            O Nexo está em testes: <b>tudo está liberado</b>, inclusive o Pro. Quando a cobrança começar, quem já usa ganha o preço de fundador. Conte o que achou em <b>Dar opinião</b>.
          </p>
        )}
        <section className="flex flex-col gap-2">
          <PlanHeader plan={FREE_PLAN} />
          <ul className="flex flex-col gap-1.5">
            {FREE_PLAN.features.map((f) => (
              <li key={f.title} className="flex gap-2 text-[14px] leading-snug text-text-secondary">
                <Check size={16} className="mt-0.5 shrink-0 text-success" /> {f.title}
              </li>
            ))}
          </ul>
        </section>
        {PAID_PLANS.map((plan) => (
          <section key={plan.name} className="flex flex-col gap-2 border-t border-border-ui pt-4">
            <PlanHeader plan={plan} locked />
            <ul className="flex flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f.title} className="flex flex-col">
                  <span className="text-[14px] font-semibold text-text-primary">
                    {f.title}
                    {f.soon && <Soon />}
                  </span>
                  {f.detail && <span className="text-[13px] leading-snug text-text-secondary">{f.detail}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Sheet>
  );
}
