import { Check, Copy, Info, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import type { LinkItem } from "../contract";
import { buildPixPayload } from "../pix";

interface PixDialogProps {
  item: LinkItem;
  /** Classes da paleta da página (o painel segue o tema do cliente, não o do Nexo). */
  cardClass: string;
  mutedClass: string;
  buttonClass: string;
  onClose: () => void;
}

/** Painel do Pix: QR Code e "copia e cola" gerados no navegador. O Nexo não vê nem confirma o pagamento. */
export function PixDialog({ item, cardClass, mutedClass, buttonClass, onClose }: PixDialogProps) {
  const payload = buildPixPayload({ key: item.pixKey ?? "", name: item.pixName ?? "", city: item.pixCity ?? "", amount: item.pixAmount });
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!payload) return;
    let alive = true;
    void QRCode.toDataURL(payload, { margin: 1, width: 480, errorCorrectionLevel: "M" }).then((url) => {
      if (alive) setQr(url);
    });
    return () => {
      alive = false;
    };
  }, [payload]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* o código continua visível para copiar à mão */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={item.label} onClick={onClose}>
      <div className={`relative flex max-h-[92vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-3xl border p-5 text-left ${cardClass}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full opacity-80 hover:opacity-100">
          <X size={20} />
        </button>
        <h2 className="pr-10 text-lg font-bold">{item.label}</h2>
        {payload ? (
          <>
            <div className="mx-auto w-full max-w-[240px] rounded-2xl bg-white p-3">{qr ? <img src={qr} alt="QR Code do Pix" className="h-auto w-full" /> : <div className="aspect-square" />}</div>
            <p className={`text-center text-[14px] ${mutedClass}`}>
              {item.pixName}
              {item.pixAmount ? ` | R$ ${item.pixAmount.toFixed(2).replace(".", ",")}` : ""}
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold">Pix copia e cola</span>
              <textarea readOnly value={payload} rows={3} onFocus={(e) => e.currentTarget.select()} className="w-full resize-none rounded-xl border bg-transparent p-3 font-mono text-[12px] leading-snug" />
              <button type="button" onClick={() => void copy()} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold ${buttonClass}`}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Código copiado" : "Copiar código"}
              </button>
            </div>
            <p className={`flex gap-2 text-[12px] leading-snug ${mutedClass}`}>
              <Info size={14} className="mt-px shrink-0" />O pagamento vai direto para quem criou esta página. O Nexo não confirma nem acompanha o Pix.
            </p>
          </>
        ) : (
          <p className={mutedClass}>Este Pix está incompleto. Avise quem criou a página.</p>
        )}
      </div>
    </div>
  );
}
