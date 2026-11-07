import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useGetBio } from "../../api/queries/useGetBio";
import { Button } from "../../shared/components/ui/Button";
import { Sheet } from "../../shared/components/ui/Sheet";
import { toast } from "../../shared/components/ui/toast-store";
import { Download, Image as ImageIcon, Loader2, Share2 } from "../../shared/icons";
import type { LandingPageRecord } from "../landing/contract";
import { FONTS } from "../landing/look/fonts";
import { resolveLook } from "../landing/look/resolve";
import { getTheme } from "../landing/look/themes";
import { withOrigin } from "../landing/origin";
import { bioUrl } from "./bioUrl";

/*
 * Material para divulgar a bio (Etapa 13.3): story e post prontos, com as cores e a fonte da bio, o nome do negócio,
 * uma frase que combina com a conversa (marcar, pedir, orçamento) e o QR do link. Desenhados no navegador, sem servidor.
 */

type Format = "story" | "post";
const SIZES: Record<Format, [number, number]> = { story: [1080, 1920], post: [1080, 1080] };

/** A frase muda com o que a conversa da bio faz. */
function headlineFor(page: LandingPageRecord) {
  const journey = page.settings.journeyFirst ? page.settings.bio?.journey : undefined;
  if (journey?.steps.some((s) => s.kind === "booking") || journey?.template === "agendar") return "Agora você marca o seu horário pela minha bio";
  if (journey?.template === "pedir") return "Agora você faz o seu pedido pela minha bio";
  if (journey?.template === "orcamento") return "Peça o seu orçamento pela minha bio";
  if (journey?.template === "contratar") return "Fale comigo e contrate pela minha bio";
  return "Tudo o que você precisa, na minha bio";
}

/** Cor que o canvas entende; senão, a reserva (temas podem ter degradê ou color-mix). */
function canvasColor(ctx: CanvasRenderingContext2D, value: unknown, fallback: string) {
  if (typeof value !== "string" || value.includes("gradient") || value.includes("color-mix")) return fallback;
  ctx.fillStyle = "#010203";
  ctx.fillStyle = value;
  return ctx.fillStyle === "#010203" && value.toLowerCase() !== "#010203" ? fallback : value;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

async function draw(page: LandingPageRecord, format: Format): Promise<string> {
  const [W, H] = SIZES[format];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const look = resolveLook(getTheme(page.theme), page.settings.look, page.settings.fontHeading);
  const vars = look.vars as Record<string, string>;
  const display = `"Bricolage Grotesque Variable", "Onest Variable", system-ui, sans-serif`;
  const heading = FONTS[look.font].family;
  await Promise.all([FONTS[look.font].load?.(), document.fonts.load(`800 80px ${display}`), document.fonts.load(`700 80px ${heading}`)]).catch(() => undefined);

  // Fundo: a cor do tema, ou o degradê dele. Padrão e foto ficam na cor de base (a segunda cor do padrão é a das linhas).
  const blend = look.bg.type === "gradient" || look.bg.type === "mesh";
  const colors = (blend ? look.bg.colors : look.bg.colors.slice(0, 1)).map((c) => canvasColor(ctx, c, "")).filter(Boolean);
  if (colors.length > 1) {
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
    ctx.fillStyle = g;
  } else ctx.fillStyle = colors[0] ?? "#0A0E1A";
  ctx.fillRect(0, 0, W, H);

  const text = canvasColor(ctx, vars["--t-text"], look.dark ? "#FFFFFF" : "#111111");
  const accent = canvasColor(ctx, vars["--t-cta"], canvasColor(ctx, vars["--t-accent"], text));
  const accentText = canvasColor(ctx, vars["--t-cta-text"], look.dark ? "#111111" : "#FFFFFF");
  const story = format === "story";
  const pad = 96;
  let y = story ? 230 : 110;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Nome do negócio, na fonte da bio.
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.85;
  ctx.font = `700 ${story ? 56 : 44}px ${heading}`;
  for (const l of wrap(ctx, page.title, W - pad * 2).slice(0, 2)) {
    ctx.fillText(l, W / 2, y);
    y += story ? 70 : 56;
  }
  ctx.globalAlpha = 1;
  y += story ? 50 : 26;

  // A frase, grande.
  const size = story ? 100 : 72;
  ctx.font = `800 ${size}px ${display}`;
  for (const l of wrap(ctx, headlineFor(page), W - pad * 2).slice(0, 4)) {
    ctx.fillText(l, W / 2, y);
    y += size * 1.08;
  }
  y += story ? 80 : 40;

  // QR num cartão branco: aponta a câmera e cai na bio.
  const url = bioUrl(page.slug);
  const qrSize = story ? 560 : 340;
  const qr = new Image();
  // Quem vê o story ou o post está no Instagram: o QR leva marcado como Instagram.
  qr.src = await QRCode.toDataURL(withOrigin(url, "instagram"), { margin: 1, width: qrSize, errorCorrectionLevel: "M" });
  await qr.decode();
  const card = qrSize + 64;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, (W - card) / 2, y, card, card, 48);
  ctx.drawImage(qr, (W - qrSize) / 2, y + 32, qrSize, qrSize);
  y += card + (story ? 70 : 34);

  // O link, num botão da cor de destaque da bio.
  ctx.font = `600 ${story ? 40 : 32}px "Onest Variable", system-ui, sans-serif`;
  const link = url.replace(/^https?:\/\//, "");
  const linkW = Math.min(W - pad, ctx.measureText(link).width + 96);
  const linkH = story ? 104 : 80;
  ctx.fillStyle = accent;
  roundRect(ctx, (W - linkW) / 2, y, linkW, linkH, linkH / 2);
  ctx.fillStyle = accentText;
  ctx.textBaseline = "middle";
  ctx.fillText(link, W / 2, y + linkH / 2, linkW - 48);

  if (story) {
    ctx.fillStyle = text;
    ctx.globalAlpha = 0.75;
    ctx.font = `500 38px "Onest Variable", system-ui, sans-serif`;
    ctx.fillText("Aponte a câmera ou toque no link do meu perfil", W / 2, y + linkH + 70);
    ctx.globalAlpha = 1;
  }
  return canvas.toDataURL("image/png");
}

async function shareOrDownload(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], name, { type: "image/png" });
  // No celular, compartilhar leva a imagem direto ao Instagram; no computador, baixa o PNG.
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {
      return; // a pessoa fechou o menu de compartilhar
    }
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}

function PromoSheet({ page, open, onClose }: { page: LandingPageRecord; open: boolean; onClose: () => void }) {
  const [images, setImages] = useState<Partial<Record<Format, string>>>({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    Promise.all([draw(page, "story"), draw(page, "post")])
      .then(([story, post]) => alive && setImages({ story, post }))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [open, page]);

  const save = (format: Format) => {
    const img = images[format];
    if (img) void shareOrDownload(img, `${page.slug}-${format}.png`).catch(() => toast.error("Não foi possível salvar a imagem."));
  };
  const canShare = typeof navigator !== "undefined" && typeof navigator.canShare === "function";

  return (
    <Sheet open={open} title="Material para divulgar" onClose={onClose} width="lg">
      <div className="flex flex-col gap-4">
        <p className="text-[14.5px] leading-snug text-text-secondary">Poste no story e no feed avisando os seus clientes. As imagens usam as cores da sua bio e o QR já leva a ela.</p>
        {failed ? (
          <p className="rounded-xl bg-danger/12 px-3 py-2 text-[14px] text-danger-strong">Não foi possível montar as imagens. Tente de novo.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
            {(["story", "post"] as const).map((f) => (
              <div key={f} className="flex flex-col gap-2.5">
                <span className="text-[13px] font-semibold text-text-secondary">{f === "story" ? "Story (1080 × 1920)" : "Post (1080 × 1080)"}</span>
                <div className={`flex items-center justify-center overflow-hidden rounded-2xl border border-border-ui bg-panel-2 ${f === "story" ? "aspect-[9/16]" : "aspect-square"}`}>
                  {images[f] ? <img src={images[f]} alt={f === "story" ? "Story de divulgação da bio" : "Post de divulgação da bio"} className="h-full w-full object-contain" /> : <Loader2 className="animate-spin text-primary" />}
                </div>
                <Button variant={f === "story" ? "gold" : "secondary"} icon={canShare ? Share2 : Download} onClick={() => save(f)} disabled={!images[f]}>
                  {canShare ? "Compartilhar" : "Baixar"} {f === "story" ? "story" : "post"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}

/** Botão que abre o material de divulgação da bio do workspace (só com a bio no ar). */
export function PromoKitButton({ className = "" }: { className?: string }) {
  const { data: page } = useGetBio();
  const [open, setOpen] = useState(false);
  if (!page?.publishedAt) return null;
  return (
    <>
      <Button variant="outline" icon={ImageIcon} onClick={() => setOpen(true)} className={className}>
        Material para divulgar
      </Button>
      <PromoSheet page={page} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
