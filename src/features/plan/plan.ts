/**
 * Planos do Nexo. Fonte: nexo/docs/ETAPAS.md, "Plano para vender" (decidido em 07/11/2026). O site mostra a mesma tabela
 * em nexo/nexo-site/src/pricing.ts: mudou aqui, mude lá. Princípio: o que custa quase nada é grátis para sempre; o pago é
 * para quem cresceu. `soon` marca o que ainda não existe no produto.
 *
 * Na fase de testes (`TRIAL`), tudo fica liberado: os recursos Pro só ganham o cadeado, para a pessoa saber.
 */
export const TRIAL = true;

/** Telas que serão do Pro (o menu e o cabeçalho mostram o cadeado). */
export const PRO_ROUTES = ["/landing-pages", "/flow-builder"];

export const isProRoute = (to: string) => PRO_ROUTES.some((r) => to === r || to.startsWith(`${r}/`));

export interface PlanFeature {
  title: string;
  detail?: string;
  soon?: boolean;
}

export interface PlanInfo {
  name: string;
  price: string;
  notes: string[];
  features: PlanFeature[];
  soon?: boolean;
}

export const FREE_PLAN: PlanInfo = {
  name: "Grátis",
  price: "R$ 0",
  notes: ["para sempre"],
  features: [
    { title: "Bio com todos os temas, fotos e Pix" },
    { title: "Conversa na bio com modelos prontos" },
    { title: "Agenda com reservas sem limite" },
    { title: "WhatsApp com a mensagem pronta" },
    { title: "QR Codes, contatos e resultados" },
    { title: "Aviso no celular a cada cliente" },
  ],
};

export const PAID_PLANS: PlanInfo[] = [
  {
    name: "Pro",
    price: "R$ 29/mês",
    notes: ["ou R$ 290 por ano", "Fundador: R$ 14,90 por mês para sempre, para os 100 primeiros"],
    features: [
      { title: "Mais de uma bio", detail: "Um espaço para cada negócio, trocados pelo seletor." },
      { title: "Páginas extras e editor de conversa", detail: "Landing pages além da bio e a conversa montada bloco a bloco." },
      { title: "Sem o selo do Nexo", detail: "Tirar o “feito com Nexo” do rodapé da bio.", soon: true },
      { title: "Domínio próprio", detail: "A bio no endereço do seu negócio.", soon: true },
      { title: "Resultados de 12 meses por origem", detail: "Quantos clientes vieram do Instagram, do Google, do QR.", soon: true },
      { title: "Lembrar os clientes do dia", detail: "Um toque para avisar todos os horários do dia.", soon: true },
    ],
  },
  {
    name: "Equipe",
    price: "R$ 79/mês",
    notes: ["com 3 pessoas, mais R$ 15 por pessoa"],
    soon: true,
    features: [
      { title: "Várias pessoas na agenda", detail: "Cada profissional com os seus serviços e horários." },
      { title: "Acesso de dono e de atendente" },
      { title: "Resultados por pessoa" },
    ],
  },
];
