/**
 * Plano do Nexo. Princípio (ver docs/ETAPAS.md, "Como o Nexo ganha dinheiro"): o que custa quase nada para o Nexo é
 * grátis para sempre; o Pro é só o que tem custo de verdade (WhatsApp oficial, IA) ou é ferramenta avançada.
 *
 * Na fase de testes (`TRIAL`), tudo fica liberado: os recursos Pro só ganham o cadeado, para a pessoa saber.
 */
export const TRIAL = true;

/** Telas que serão do Pro (o menu e o cabeçalho mostram o cadeado). */
export const PRO_ROUTES = ["/landing-pages", "/flow-builder"];

export const isProRoute = (to: string) => PRO_ROUTES.some((r) => to === r || to.startsWith(`${r}/`));

export const FREE_FOREVER = [
  "Bio com links, Pix, produtos e fotos",
  "Todos os temas e o visual personalizado",
  "QR Codes, resultados e leads",
  "Avisos no celular",
  "Bot da bio com perguntas e botões",
];

export const PRO_FEATURES = [
  { title: "Canais oficiais", detail: "Bot dentro do WhatsApp (API oficial), Instagram Direct e Telegram. A Meta cobra por conversa." },
  { title: "Respostas com IA sem limite", detail: "No grátis, a IA terá uma cota por mês; depois dela o bot segue com os botões." },
  { title: "Fluxos avançados", detail: "Montar o bot bloco a bloco no editor de fluxos." },
  { title: "Páginas extras", detail: "Landing pages além da sua bio." },
  { title: "Sem o selo do Nexo", detail: "Tirar o “feito com Nexo” do rodapé da bio." },
];
