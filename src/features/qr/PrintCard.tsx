import { ScanLine } from "../../shared/icons";
import { createPortal } from "react-dom";

interface PrintCardProps {
  qrSrc: string;
  title: string;
  label: string;
  /** Linha pequena embaixo (ex.: nome da rede no Wi-Fi). */
  caption?: string;
  /** Tamanho de impressão (cerca de 11 cm de largura) em vez do tamanho da prévia. */
  print?: boolean;
}

/**
 * Cartão para imprimir e colar no balcão, na mesa ou na vitrine. É papel: fundo branco e texto
 * escuro nos dois temas, para a prévia ser igual ao que sai da impressora.
 */
export function PrintCard({ qrSrc, title, label, caption, print }: PrintCardProps) {
  return (
    <div
      className={`mx-auto flex flex-col items-center bg-white text-center text-neutral-900 ${
        print ? "w-[110mm] gap-[6mm] rounded-[8mm] border-[0.6mm] border-neutral-300 p-[10mm]" : "w-full max-w-[300px] gap-3 rounded-3xl border border-neutral-200 p-5 shadow-card"
      }`}
    >
      <p className={`font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere] ${print ? "text-[22pt]" : "text-[20px]"}`}>{title}</p>
      <img src={qrSrc} alt="" className={print ? "h-[80mm] w-[80mm]" : "aspect-square w-full max-w-[220px]"} />
      <div className="flex flex-col items-center gap-1">
        <span className={`inline-flex items-center gap-1.5 font-semibold text-neutral-600 ${print ? "text-[12pt]" : "text-[13px]"}`}>
          <ScanLine size={print ? 18 : 15} /> Aponte a câmera do celular
        </span>
        <span className={`font-bold [overflow-wrap:anywhere] ${print ? "text-[14pt]" : "text-[15px]"}`}>{label}</span>
        {caption && <span className={`text-neutral-600 [overflow-wrap:anywhere] ${print ? "text-[11pt]" : "text-[13px]"}`}>{caption}</span>}
      </div>
    </div>
  );
}

/** Área de impressão fora do app: o CSS `@media print` do index.css esconde todo o resto. */
export function PrintArea(props: Omit<PrintCardProps, "print">) {
  return createPortal(
    <div id="nx-print-root">
      <div className="flex justify-center pt-[10mm]">
        <PrintCard {...props} print />
      </div>
    </div>,
    document.body,
  );
}
