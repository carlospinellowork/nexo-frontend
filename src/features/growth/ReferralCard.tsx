import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../api/instance";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "../../shared/components/ui/toast-store";
import { Check, Copy, Users } from "../../shared/icons";
import { useWorkspaceStore } from "../workspaces/store/workspace-store";

const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? "https://nexo.app";

/**
 * Indique o Nexo (Etapa 17): o link de indicação é o site com a bio do dono como referência. Quem cria a conta por ele
 * conta aqui. Só aparece com a bio criada (a bio é o código da indicação).
 */
export function ReferralCard() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data } = useQuery({
    queryKey: ["referrals", workspaceId],
    queryFn: async () => (await api.get<{ code: string | null; count: number }>("/me/referrals")).data,
    enabled: !!workspaceId,
  });
  const [copied, setCopied] = useState(false);
  if (!data?.code) return null;
  const link = `${SITE_URL}/?via=indicacao&ref=${encodeURIComponent(data.code)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Tente de novo.");
    }
  };
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-4 shadow-card md:flex-row md:items-center md:gap-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Users size={22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="text-[15px] font-bold text-text-primary">Indique o Nexo para outro negócio</h2>
        <p className="text-[13.5px] leading-snug text-text-secondary">
          Quem criar a conta pelo seu link conta como sua indicação. Quando a cobrança começar, cada negócio indicado vale 1 mês de Pro para você.
        </p>
        <p className="text-[13px] font-semibold text-text-primary">{data.count === 0 ? "Nenhuma indicação ainda." : data.count === 1 ? "1 negócio chegou pelo seu link." : `${data.count} negócios chegaram pelo seu link.`}</p>
      </div>
      <Button variant="outline" icon={copied ? Check : Copy} onClick={() => void copy()} className="shrink-0">
        {copied ? "Link copiado" : "Copiar meu link"}
      </Button>
    </section>
  );
}
