const KEY = "nexo_pending_invite";

/** Convite aberto antes de entrar: fica no aparelho até a pessoa fazer login (ou criar a conta). */
export function savePendingInvite(token: string) {
  try {
    localStorage.setItem(KEY, token.slice(0, 64));
  } catch {
    /* navegação privada: a pessoa abre o link de novo depois de entrar */
  }
}

export function takePendingInvite(): string | null {
  try {
    const token = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return token;
  } catch {
    return null;
  }
}
