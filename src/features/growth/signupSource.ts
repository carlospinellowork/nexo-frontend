/*
 * Como a conta chegou ao Nexo (Etapa 17). O site manda `?via=selo|reserva|indicacao|site&ref=<bio>` para o login; o
 * painel guarda isso no aparelho e manda uma vez depois do cadastro (o servidor só grava em conta nova).
 */
const KEY = "nexo_signup_source";
const VIAS = ["selo", "reserva", "indicacao", "site"] as const;
export type SignupVia = (typeof VIAS)[number];
export interface SignupSource {
  via: SignupVia;
  ref?: string;
}

/** Lê a origem do endereço do login e guarda. Sem `via`, não muda o que já estava guardado. */
export function captureSignupSource(search = window.location.search) {
  const q = new URLSearchParams(search);
  const via = q.get("via");
  if (!(VIAS as readonly string[]).includes(via ?? "")) return;
  const ref = q.get("ref")?.slice(0, 100) || undefined;
  try {
    localStorage.setItem(KEY, JSON.stringify({ via, ...(ref ? { ref } : {}) }));
  } catch {
    /* navegação privada: a origem só não é contada */
  }
}

export function storedSignupSource(): SignupSource | null {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SignupSource) : null;
    return parsed && (VIAS as readonly string[]).includes(parsed.via) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSignupSource() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* sem armazenamento: nada a apagar */
  }
}
