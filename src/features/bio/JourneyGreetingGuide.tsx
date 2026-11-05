import { useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { textareaClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { Check, Copy } from "../../shared/icons";
import { BioSheet } from "./BioSheet";

const STEPS = ["Abra o WhatsApp Business.", "Toque em Configurações e depois em Ferramentas comerciais.", "Escolha Mensagem de saudação e ligue a opção.", "Cole o texto abaixo e salve."];

/** Guia da saudação: quem escreve no WhatsApp do negócio recebe o link da jornada, sem API e sem custo. */
export function JourneyGreetingGuide({ url, invite, onClose }: { url: string; invite: string; onClose: () => void }) {
  const [text, setText] = useState(`${invite} ${url}`.trim());
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto e copie à mão.");
    }
  };

  return (
    <BioSheet title="Pôr na saudação do WhatsApp" onClose={onClose}>
      <p className="text-[14px] leading-snug text-text-secondary">Quem mandar a primeira mensagem para você recebe o link na hora. A saudação é um recurso do próprio WhatsApp Business.</p>
      <ol className="flex flex-col gap-2">
        {STEPS.map((step, i) => (
          <li key={step} className="flex gap-2.5 text-[14px] leading-snug text-text-primary">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[13px] font-bold text-primary-strong">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <textarea aria-label="Texto da saudação" className={`${textareaClass} min-h-24 text-[16px] min-[420px]:text-[14px]`} value={text} maxLength={500} onChange={(e) => setText(e.target.value)} />
      <Button size="lg" icon={copied ? Check : Copy} onClick={() => void copy()}>
        {copied ? "Copiado" : "Copiar texto"}
      </Button>
      <p className="text-[13px] leading-snug text-text-secondary">A pessoa ainda precisa tocar no link. Se ela responder sem tocar, a conversa continua com você, como sempre.</p>
    </BioSheet>
  );
}
