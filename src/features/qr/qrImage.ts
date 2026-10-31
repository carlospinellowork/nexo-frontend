import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Nível M: aguenta um pouco de sujeira ou dobra no impresso sem deixar o QR denso demais. */
const OPTIONS = { margin: 2, errorCorrectionLevel: "M" } as const;

const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** SVG do QR como data URL, para mostrar num <img>. Null enquanto gera ou sem conteúdo. */
export function useQrSvg(content: string | null | undefined) {
  const [result, setResult] = useState<{ content: string; url: string } | null>(null);

  useEffect(() => {
    if (!content) return;
    let alive = true;
    void QRCode.toString(content, { ...OPTIONS, type: "svg" }).then((svg) => {
      if (alive) setResult({ content, url: svgDataUrl(svg) });
    });
    return () => {
      alive = false;
    };
  }, [content]);

  return content && result?.content === content ? result.url : null;
}

const fileName = (label: string, ext: string) =>
  `qrcode-${
    label
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "nexo"
  }.${ext}`;

function save(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** PNG de 1024 px, bom para gráfica e redes sociais. */
export async function downloadPng(content: string, label: string) {
  save(await QRCode.toDataURL(content, { ...OPTIONS, width: 1024 }), fileName(label, "png"));
}

/** SVG em vetor, para ampliar sem perder qualidade (banner, adesivo, cardápio). */
export async function downloadSvg(content: string, label: string) {
  const svg = await QRCode.toString(content, { ...OPTIONS, type: "svg" });
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  save(url, fileName(label, "svg"));
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
