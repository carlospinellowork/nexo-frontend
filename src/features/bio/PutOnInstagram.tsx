import { useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { Check, ChevronRight, Instagram } from "../../shared/icons";
import { withOrigin } from "../landing/origin";
import { SocialGuide } from "./SocialGuide";

const INSTAGRAM_EDIT = "https://www.instagram.com/accounts/edit/";

/**
 * O jeito mais curto de pôr a bio no Instagram: um toque copia o link e abre o Instagram; a tela diz só onde colar.
 * O texto da bio do Instagram não deixa link clicável, por isso o caminho é Editar perfil › Links.
 * "Outras redes" abre o passo a passo completo (TikTok, WhatsApp...).
 */
export function PutOnInstagram({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  const [others, setOthers] = useState(false);

  // Copia antes de abrir, ainda dentro do toque: o navegador só deixa copiar durante o gesto da pessoa.
  const go = () => {
    // Marcado como Instagram: Resultados mostra quantos clientes vieram de lá.
    void navigator.clipboard?.writeText(withOrigin(url, "instagram")).catch(() => {});
    setDone(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <a
        href={INSTAGRAM_EDIT}
        target="_blank"
        rel="noreferrer"
        onClick={go}
        className="nx-btn-gold nx-anim flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3 text-[16px] font-bold active:scale-[0.98]"
      >
        <Instagram size={22} />
        Colocar no Instagram
      </a>
      <p className="text-center text-[12.5px] text-text-secondary">Copia o link da sua bio e abre o Instagram.</p>

      <div className={`rounded-2xl px-4 py-3 text-[14.5px] leading-snug ${done ? "bg-success/14 text-success-strong" : "bg-panel-2 text-text-secondary"}`}>
        {done && (
          <span className="mb-1 flex items-center gap-1.5 font-semibold">
            <Check size={16} /> Link copiado
          </span>
        )}
        <span className={done ? "text-text-primary" : ""}>
          {done ? "Agora, no Instagram" : "Depois, no Instagram"}: toque em <b>Editar perfil</b> › <b>Links</b> › <b>Adicionar link externo</b> e cole. Só isso.
        </span>
      </div>

      <button type="button" onClick={() => setOthers(true)} className="mx-auto flex min-h-11 items-center gap-1 px-3 text-[14px] font-semibold text-primary-strong hover:underline">
        Outras redes: TikTok, WhatsApp, YouTube <ChevronRight size={16} />
      </button>
      <SocialGuide url={url} network="tiktok" open={others} onClose={() => setOthers(false)} />
    </div>
  );
}

/** O mesmo, numa janela: aberto pelo botão da barra da bio, pelo Início e logo depois de publicar. */
export function PutOnInstagramSheet({ url, open, onClose, title = "Colocar no Instagram" }: { url: string; open: boolean; onClose: () => void; title?: string }) {
  return (
    <Sheet open={open} title={title} onClose={onClose} width="sm" footer={<Button variant="ghost" size="lg" className="w-full" onClick={onClose}>Fechar</Button>}>
      <PutOnInstagram url={url} />
    </Sheet>
  );
}
