import { Check, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "../../shared/components/ui/toast-store";

import { bioUrl } from "./bioUrl";

/** Link, QR Code, compartilhar e o passo a passo para colar na bio das redes. */
export function BioShare({ slug, name, showSteps = true }: { slug: string; name: string; showSteps?: boolean }) {
  const url = bioUrl(slug);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
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
      </div>

      {showSteps && (
        <div className="rounded-3xl bg-panel p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-primary">Cole na bio das suas redes</h3>
          <ol className="mt-3 flex flex-col gap-3 text-[14px] leading-snug text-text-secondary">
            <li>
              <strong className="text-text-primary">Instagram:</strong> Editar perfil, Links, Adicionar link externo, cole o endereço e salve.
            </li>
            <li>
              <strong className="text-text-primary">TikTok:</strong> Editar perfil, campo Site (ou Link), cole o endereço e salve.
            </li>
            <li>
              <strong className="text-text-primary">Stories e impressos:</strong> baixe o QR Code e use onde quiser.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
