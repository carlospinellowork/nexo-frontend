import { useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { toast } from "../../shared/components/ui/toast-store";
import { Check, ChevronRight, Copy, ExternalLink, Instagram, Link2 } from "../../shared/icons";

/** Desenho simples da tela "Editar perfil" com o caminho até o campo certo (não é print do Instagram). */
function EditProfileMock({ url }: { url: string }) {
  const row = (label: string, value: string, highlight = false) => (
    <div className={`flex items-center gap-2 border-b border-black/5 px-3 py-2 text-[12.5px] ${highlight ? "bg-primary/10" : ""}`}>
      <span className="w-14 shrink-0 text-black/50">{label}</span>
      <span className={`min-w-0 flex-1 truncate ${highlight ? "font-semibold text-primary-strong" : "text-black/80"}`}>{value}</span>
      {highlight && <ChevronRight size={14} className="text-primary-strong" />}
    </div>
  );
  return (
    <div className="overflow-hidden rounded-2xl border border-border-ui bg-white text-black shadow-card" aria-hidden>
      <div className="border-b border-black/5 py-2 text-center text-[13px] font-semibold">Editar perfil</div>
      {row("Nome", "Seu nome")}
      {row("Bio", "O texto da bio (aqui o link não fica clicável)")}
      {row("Links", "Adicionar link externo", true)}
      <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 text-[12px]">
        <Link2 size={14} className="shrink-0 text-primary-strong" />
        <span className="min-w-0 flex-1 truncate font-mono text-black/70">{url}</span>
      </div>
    </div>
  );
}

/**
 * Passo a passo para pôr o link da bio no Instagram. O Instagram não deixa outro app mexer no perfil de ninguém
 * (não existe API para isso), então o Nexo deixa o link copiado, abre o Instagram e mostra onde tocar.
 */
export function InstagramGuide({ url, open, onClose }: { url: string; open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      toast.error("Não foi possível copiar. Selecione o endereço e copie à mão.");
    }
  };

  const step = (n: number, done: boolean, title: string, children: React.ReactNode) => (
    <li className="flex gap-3">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${done ? "bg-success text-white" : "bg-primary/12 text-primary-strong"}`}>
        {done ? <Check size={15} /> : n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[15px] font-semibold text-text-primary">{title}</span>
        {children}
      </div>
    </li>
  );

  return (
    <Sheet open={open} title="Colocar no Instagram" onClose={onClose} width="md" footer={<Button size="lg" className="w-full" onClick={onClose}>Pronto</Button>}>
      <ol className="flex flex-col gap-5">
        {step(
          1,
          copied,
          "Copie o link da sua bio",
          <Button variant={copied ? "secondary" : "primary"} icon={copied ? Check : Copy} onClick={() => void copy()} className="w-full sm:w-fit">
            {copied ? "Link copiado" : "Copiar link"}
          </Button>,
        )}
        {step(
          2,
          opened,
          "Abra o Instagram e toque em Editar perfil",
          <a
            href="https://www.instagram.com/accounts/edit/"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpened(true)}
            className="nx-anim inline-flex h-11 w-full items-center justify-center gap-2 rounded-[11px] border border-border-ui bg-panel px-4 text-[14px] font-semibold text-text-primary hover:bg-panel-hover sm:w-fit"
          >
            <Instagram size={18} /> Abrir o Instagram <ExternalLink size={14} className="text-text-secondary" />
          </a>,
        )}
        {step(
          3,
          false,
          "Toque em Links › Adicionar link externo",
          <>
            <EditProfileMock url={url} />
            <p className="text-[13.5px] leading-snug text-text-secondary">
              Cole o link no campo <b className="text-text-primary">URL</b>, escreva um título (ex.: &ldquo;Fale comigo&rdquo; ou &ldquo;Agende aqui&rdquo;) e toque em{" "}
              <b className="text-text-primary">Concluir</b>. Se já tiver outros links, arraste o do Nexo para o primeiro lugar.
            </p>
          </>,
        )}
        {step(
          4,
          false,
          "Confira no seu perfil",
          <p className="text-[13.5px] leading-snug text-text-secondary">
            O link aparece logo abaixo do texto da bio, com um ícone de corrente. Toque nele para ver a sua bio do Nexo abrindo.
            Não cole o link no texto da bio: ali o Instagram não deixa clicar.
          </p>,
        )}
      </ol>
    </Sheet>
  );
}
