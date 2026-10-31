/**
 * Recorta a foto no centro (quadrado) e reduz para 256 px em JPEG, no próprio navegador.
 * Fica bem abaixo do limite de 120 KB do servidor; se passar, tenta de novo com qualidade menor.
 */
export async function toAvatarDataUrl(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp|heic|heif)$/.test(file.type) && !file.type.startsWith("image/")) throw new Error("Escolha uma imagem (foto).");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não deu para abrir essa imagem. Tente uma foto JPEG ou PNG.");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
  bitmap.close();
  for (const quality of [0.85, 0.7, 0.55]) {
    const url = canvas.toDataURL("image/jpeg", quality);
    if (url.length < 150_000) return url;
  }
  throw new Error("A foto ficou grande demais. Tente outra.");
}
