import { API_ORIGIN } from "../../api/instance";

const UPLOADED = /^\/api\/public\/images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Endereço de imagem que as páginas mostram: https ou foto enviada ao Nexo (espelho de domain/images.ts da API). */
export const isImageUrl = (u: string | null | undefined): u is string => typeof u === "string" && (/^https:\/\/\S+$/.test(u) || UPLOADED.test(u));
export const isUploadedImage = (u: string | null | undefined) => typeof u === "string" && UPLOADED.test(u);

/** `src` da imagem: a foto enviada fica em /api/... e passa pela origem da API (no ar é o próprio domínio). */
export const imageSrc = (u: string) => (UPLOADED.test(u) ? `${API_ORIGIN}${u}` : u);

export type ImageShape = "square" | "wide" | "portrait";

/** Lado maior de cada formato: o bastante para celular com tela de alta densidade, sem pesar. */
const SIZES: Record<ImageShape, { w: number; h: number }> = {
  square: { w: 512, h: 512 },
  wide: { w: 1200, h: 900 },
  portrait: { w: 1080, h: 1920 },
};

/**
 * Reduz a foto no próprio aparelho antes de enviar (JPEG). `square` recorta no centro (foto de perfil); os outros
 * só diminuem, mantendo a proporção. Se ainda passar de ~600 KB, tenta de novo com qualidade menor.
 */
export async function shrinkImage(file: File, shape: ImageShape): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Escolha uma imagem (foto).");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não deu para abrir essa imagem. Tente uma foto JPEG ou PNG.");
  });
  const max = SIZES[shape];
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;
  let w: number;
  let h: number;
  if (shape === "square") {
    const side = Math.min(sw, sh);
    sx = (sw - side) / 2;
    sy = (sh - side) / 2;
    sw = sh = side;
    w = h = Math.min(max.w, side);
  } else {
    const scale = Math.min(1, max.w / sw, max.h / sh);
    w = Math.round(sw * scale);
    h = Math.round(sh * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
  ctx.fillStyle = "#FFFFFF"; // PNG com transparência vira JPEG com fundo branco
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
  bitmap.close();
  for (const quality of [0.86, 0.75, 0.62, 0.5]) {
    const url = canvas.toDataURL("image/jpeg", quality);
    if (url.length < 800_000) return url;
  }
  throw new Error("A foto ficou grande demais. Tente outra.");
}
