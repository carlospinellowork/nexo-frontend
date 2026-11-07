import { useState } from "react";
import { toast } from "../../shared/components/ui/toast-store";
import { Check, Copy, type IconComponent, Instagram, Rocket, Search, Users, WhatsApp } from "../../shared/icons";
import { type Origin, withOrigin } from "../landing/origin";

/** Onde colar cada link. O Google (Perfil da Empresa) aceita o link de qualquer agenda no botão de reservar. */
const CHANNELS: { origin: Origin; icon: IconComponent; title: string; where: string }[] = [
  { origin: "instagram", icon: Instagram, title: "Instagram", where: "Editar perfil, no campo Links." },
  { origin: "google", icon: Search, title: "Google", where: "Perfil da Empresa: Editar perfil, em Links de reserva (ou Site)." },
  { origin: "whatsapp", icon: WhatsApp, title: "WhatsApp", where: "Saudação do WhatsApp Business, status e catálogo." },
  { origin: "anuncio", icon: Rocket, title: "Anúncio", where: "No destino do anúncio pago (Instagram, Facebook, Google)." },
  { origin: "indicacao", icon: Users, title: "Indicação", where: "Para mandar a quem pede indicação ou para parceiros." },
];

/**
 * Um link para cada lugar (Etapa 14): a mesma bio, marcada com a origem, para Resultados mostrar quantos clientes vieram
 * de cada canal. O QR Code já marca o dele sozinho.
 */
export function ChannelLinks({ url }: { url: string }) {
  const [copied, setCopied] = useState<Origin | null>(null);
  const copy = async (origin: Origin) => {
    try {
      await navigator.clipboard.writeText(withOrigin(url, origin));
      setCopied(origin);
      setTimeout(() => setCopied((c) => (c === origin ? null : c)), 2000);
    } catch {
      toast.error("Não foi possível copiar. Tente de novo.");
    }
  };
  return (
    <div className="flex w-full flex-col gap-2 border-t border-border-ui pt-4">
      <div>
        <h3 className="text-[15px] font-bold text-text-primary">Um link para cada lugar</h3>
        <p className="text-[13px] leading-snug text-text-secondary">É a mesma bio. Com o link certo em cada canal, Resultados mostra de onde veio cada cliente.</p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {CHANNELS.map((c) => (
          <li key={c.origin} className="flex items-center gap-3 rounded-2xl bg-panel-2 px-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <c.icon size={17} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[14px] font-semibold text-text-primary">{c.title}</span>
              <span className="text-[12px] leading-snug text-text-secondary">{c.where}</span>
            </span>
            <button
              type="button"
              onClick={() => void copy(c.origin)}
              aria-label={`Copiar o link para ${c.title}`}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-primary-strong hover:bg-primary/10 md:h-9"
            >
              {copied === c.origin ? <Check size={16} /> : <Copy size={16} />}
              {copied === c.origin ? "Copiado" : "Copiar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
