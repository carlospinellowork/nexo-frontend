/**
 * Pix direto, sem gateway: monta o "Pix copia e cola" (BR Code estático, padrão EMV do Banco Central).
 * O Nexo não recebe nem confirma o pagamento; o dinheiro vai direto para a chave informada.
 */

/** Chave Pix normalizada (CPF/CNPJ só dígitos, e-mail, telefone +55 ou chave aleatória); "" se inválida. */
export function normalizePixKey(raw: string): string {
  const key = raw.trim();
  if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(key)) return key.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return key.toLowerCase();
  const phone = key.replace(/[\s()-]/g, "");
  if (/^\+55\d{10,11}$/.test(phone)) return phone;
  const digits = key.replace(/[.\-/\s]/g, "");
  if (/^\d{11}$|^\d{14}$/.test(digits)) return digits;
  return "";
}

/** CRC16/CCITT-FALSE (polinômio 0x1021, início 0xFFFF), como exige o BR Code. */
export function crc16(text: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Campo EMV: o tamanho tem 2 dígitos, então o valor cabe em até 99 bytes. */
const MAX_FIELD_BYTES = 99;
const bytes = (value: string) => new TextEncoder().encode(value).length;
const field = (id: string, value: string) => `${id}${String(bytes(value)).padStart(2, "0")}${value}`;

/** Maiúsculas, sem acento e só caracteres simples (o BR Code aceita ASCII). */
const ascii = (text: string, max: number) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, max);

export interface PixInput {
  key: string;
  name: string;
  city: string;
  amount?: number;
}

/** Devolve o código "copia e cola", ou "" se faltar chave válida, nome ou cidade. */
export function buildPixPayload({ key, name, city, amount }: PixInput): string {
  const pixKey = normalizePixKey(key);
  const receiver = ascii(name, 25);
  const town = ascii(city, 15);
  if (!pixKey || !receiver || !town) return "";
  // O campo 26 leva "br.gov.bcb.pix" (18 bytes com cabeçalho) mais a chave (+4): precisa caber em 99.
  if (bytes(field("00", "br.gov.bcb.pix") + field("01", pixKey)) > MAX_FIELD_BYTES) return "";
  const body =
    field("00", "01") +
    field("01", "11") +
    field("26", field("00", "br.gov.bcb.pix") + field("01", pixKey)) +
    field("52", "0000") +
    field("53", "986") +
    (amount && amount > 0 ? field("54", amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", receiver) +
    field("60", town) +
    field("62", field("05", "***")) +
    "6304";
  return body + crc16(body);
}
