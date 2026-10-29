import type { LandingTheme } from "../landing/contract";

export const BIO_AUDIENCES = ["creator", "seller", "business"] as const;
export type BioAudience = (typeof BIO_AUDIENCES)[number];

export interface BioFaq {
  id?: string;
  question: string;
  answer: string;
}

export interface FaqSuggestion {
  question: string;
  /** Exemplo de resposta, mostrado como dica no campo (o criador escreve a dele). */
  hint: string;
}

export interface AudiencePreset {
  title: string;
  description: string;
  defaultTheme: LandingTheme;
  namePlaceholder: string;
  taglinePlaceholder: string;
  linksPlaceholder: string;
  pixLabel: string;
  suggestions: FaqSuggestion[];
  /** Vendedor: o passo de links oferece cadastrar produtos. */
  offersProducts: boolean;
}

export const AUDIENCE_PRESETS: Record<BioAudience, AudiencePreset> = {
  creator: {
    title: "Criador de conteúdo",
    description: "Redes, parcerias e apoio dos seguidores",
    defaultTheme: "midnight-dark",
    namePlaceholder: "Ana Souza",
    taglinePlaceholder: "Receitas rápidas e vida saudável",
    linksPlaceholder: "instagram.com/seuperfil\ntiktok.com/@seuperfil\nyoutube.com/@seucanal\n11 91234-5678",
    pixLabel: "Me apoie com um Pix",
    offersProducts: false,
    suggestions: [
      { question: "Como faço parceria com você?", hint: "Mande um recado no WhatsApp com a marca e a ideia." },
      { question: "Onde acho o link do vídeo de ontem?", hint: "Está nos links aqui da bio." },
      { question: "Você tem cupom de desconto?", hint: "Use o código ANA10 nas lojas parceiras." },
      { question: "Posso te apoiar de algum jeito?", hint: "Pode sim, pelo botão de Pix aqui da bio." },
      { question: "Qual a melhor forma de falar com você?", hint: "Pelo WhatsApp, respondo no mesmo dia." },
    ],
  },
  seller: {
    title: "Vendedor",
    description: "Produtos, lojas e atendimento no WhatsApp",
    defaultTheme: "modern-blue",
    namePlaceholder: "Loja da Bia",
    taglinePlaceholder: "Moda feminina com entrega para todo o Brasil",
    linksPlaceholder: "instagram.com/sualoja\nmercadolivre.com.br/sualoja\nshopee.com.br/sualoja\n11 91234-5678",
    pixLabel: "Pagar com Pix",
    offersProducts: true,
    suggestions: [
      { question: "Qual o prazo de entrega?", hint: "De 3 a 7 dias úteis, conforme o CEP." },
      { question: "Quais formas de pagamento?", hint: "Pix, cartão em até 6 vezes e boleto." },
      { question: "Como faço uma troca?", hint: "Em até 7 dias, pelo WhatsApp, com o código do pedido." },
      { question: "Tem esse produto em estoque?", hint: "Me diga o modelo e eu confirmo na hora." },
      { question: "Vocês vendem no atacado?", hint: "Sim, a partir de 10 peças. Fale no WhatsApp." },
    ],
  },
  business: {
    title: "Empresa",
    description: "Serviços, horários e atendimento ao cliente",
    defaultTheme: "clean-slate",
    namePlaceholder: "Clínica Sorriso",
    taglinePlaceholder: "Atendimento com hora marcada, de segunda a sábado",
    linksPlaceholder: "instagram.com/suaempresa\nsuaempresa.com.br\ng.page/suaempresa\n11 91234-5678",
    pixLabel: "Pagar com Pix",
    offersProducts: false,
    suggestions: [
      { question: "Qual o horário de atendimento?", hint: "De segunda a sexta, das 9h às 18h." },
      { question: "Como agendo um horário?", hint: "Pelo WhatsApp, é só dizer o dia que prefere." },
      { question: "Quanto custa?", hint: "Depende do serviço. Me conte o que precisa e eu passo o valor." },
      { question: "Qual o endereço?", hint: "Rua das Flores, 100, Centro." },
      { question: "Vocês aceitam convênio?", hint: "Aceitamos os principais. Fale no WhatsApp para confirmar." },
    ],
  },
};

/** Opções do botão "+ Adicionar" do editor da bio. */
export const NEW_ITEM_OPTIONS = [
  { key: "whatsapp", label: "WhatsApp", hint: "Com mensagem pronta" },
  { key: "instagram", label: "Instagram", hint: "Seu perfil" },
  { key: "tiktok", label: "TikTok", hint: "Seu perfil" },
  { key: "youtube", label: "YouTube", hint: "Seu canal" },
  { key: "site", label: "Site ou outro link", hint: "Qualquer endereço https" },
  { key: "pix", label: "Pix", hint: "QR Code e copia e cola" },
  { key: "product", label: "Produto", hint: "Com botões de compra" },
] as const;
export type NewItemKey = (typeof NEW_ITEM_OPTIONS)[number]["key"];
