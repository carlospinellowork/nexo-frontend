import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronRight, Copy, Download, ExternalLink, QrCode, Share2 } from "../../shared/icons";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { TONES } from "../../shared/components/ui/tones";
import { toast } from "../../shared/components/ui/toast-store";

import { bioUrl } from "./bioUrl";
import { PutOnInstagram } from "./PutOnInstagram";
import { SocialGuide } from "./SocialGuide";
import { NETWORK_IDS, NETWORKS, type SocialNetwork } from "./socialNetworks";

/** Link, QR Code, compartilhar e o passo a passo para colar na bio das redes. */
export function BioShare({ slug, name, showSteps = true }: { slug: string; name: string; showSteps?: boolean }) {
  const url = bioUrl(slug);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [guide, setGuide] = useState<SocialNetwork | null>(null);
  const [lastGuide, setLastGuide] = useState<SocialNetwork>("instagram");
  const openGuide = (n: SocialNetwork) => {
    setLastGuide(n);
    setGuide(n);
  };
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    let alive = true;
    void QRCode.toDataURL(url, { margin: 2, width: 1024, errorCorrectionLevel: "M" }).then((data) => {
      if (alive) setQr(data);
    });
    return () => {
      alive = false;
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o endereço e copie à mão.");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: name, text: `Conheça ${name}`, url });
    } catch {
      /* a pessoa fechou o menu de compartilhar */
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = qr;
    a.download = `qrcode-${slug}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-panel p-5 shadow-card">
        <div className="w-full max-w-[220px] rounded-2xl bg-white p-2">{qr ? <img src={qr} alt={`QR Code de ${url}`} className="h-auto w-full" /> : <div className="aspect-square" />}</div>
        <div className="flex w-full items-center gap-2 rounded-xl bg-panel-2 p-1 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-text-primary">{url}</span>
          <a href={url} target="_blank" rel="noreferrer" aria-label="Abrir a bio" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover">
            <ExternalLink size={18} />
          </a>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          <Button size="lg" icon={copied ? Check : Copy} onClick={() => void copy()}>
            {copied ? "Link copiado" : "Copiar link"}
          </Button>
          {canShare ? (
            <Button size="lg" variant="secondary" icon={Share2} onClick={() => void share()}>
              Compartilhar
            </Button>
          ) : (
            <Button size="lg" variant="secondary" icon={Download} onClick={download} disabled={!qr}>
              Baixar QR Code
            </Button>
          )}
        </div>
        {canShare && (
          <Button variant="ghost" icon={Download} onClick={download} disabled={!qr} className="w-full">
            Baixar QR Code (PNG)
          </Button>
        )}
        {!showSteps && (
          <div className="w-full border-t border-border-ui pt-4">
            <PutOnInstagram url={url} />
          </div>
        )}
        <SocialGuide url={url} network={guide ?? lastGuide} open={guide !== null} onClose={() => setGuide(null)} />
        <Link
          to="/qr-codes"
          search={{ novo: "bio" }}
          className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-panel-2 px-3.5 py-2.5 text-left transition-colors hover:bg-panel-hover"
        >
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES.lagoon.chip}`}>
            <QrCode size={18} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[14px] font-semibold text-text-primary">Criar QR Code da sua bio</span>
            <span className="text-[12px] leading-snug text-text-secondary">Conta as leituras e vem com cartão para imprimir.</span>
          </span>
          <ArrowRight size={16} className="shrink-0 text-text-secondary" />
        </Link>
      </div>

      {showSteps && (
        <div className="rounded-3xl bg-panel p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-primary">Outras redes, passo a passo</h3>
          <p className="mt-1.5 rounded-xl bg-warning/14 px-3 py-2 text-[13px] leading-snug text-warning-strong">
            No texto da bio o link não fica clicável (regra do Instagram e do TikTok). Ele precisa ir no campo de links do perfil.
          </p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {NETWORK_IDS.map((id) => {
              const n = NETWORKS[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => openGuide(id)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-panel-2 px-3.5 py-2 text-left transition-colors hover:bg-panel-hover"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES.lagoon.chip}`}>
                      <n.icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] font-semibold text-text-primary">{n.label}</span>
                    <span className="text-[12.5px] text-text-secondary">Passo a passo</span>
                    <ChevronRight size={16} className="shrink-0 text-text-secondary" />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[13px] leading-snug text-text-secondary">
            <strong className="text-text-primary">Stories e impressos:</strong> baixe o QR Code e use onde quiser.
          </p>
        </div>
      )}
    </div>
  );
}
