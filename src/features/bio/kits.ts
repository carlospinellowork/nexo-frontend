import type { IconComponent } from "../../shared/icons";
import { Lipstick, Mic, Stethoscope, UserStar, Utensils } from "../../shared/icons";
import type { LandingTheme, LinkItem } from "../landing/contract";
import { AUDIENCE_PRESETS, type AudiencePreset, type BioAudience } from "./presets";

/*
 * Kits por nicho: o Nexo serve qualquer público, mas estes ganham atenção especial. Cada kit traz o botão do WhatsApp
 * com a mensagem certa para o nicho (o pedido chega pronto), as perguntas que esse público recebe, os textos de
 * exemplo e os temas que combinam. Mesma lista de ids em nexo-backend/src/domain/landing/contract.ts (BIO_KITS).
 */

export const BIO_KITS = ["beleza", "comida", "artista", "influencer", "saude"] as const;
export type BioKit = (typeof BIO_KITS)[number];

export interface Kit extends AudiencePreset {
  id: BioKit;
  icon: IconComponent;
  /** Público-base (decide o tipo de bot e o que o assistente oferece). */
  audience: BioAudience;
  /** O botão principal do WhatsApp, com a mensagem que já chega pronta para o dono. */
  whatsappLabel: string;
  whatsappMessage: string;
  /** A pergunta de contato, já respondida (é verdade: a bio tem o botão). */
  contact: { question: string; answer: string };
  /** As duas perguntas da "Bio em 1 minuto" (índices em suggestions). */
  expressPicks: [number, number];
  /** Temas sugeridos, o primeiro é o padrão. */
  themes: LandingTheme[];
  /** Palavras do segmento contado no "conhecer você" que indicam este kit (sem acento, minúsculas). */
  matches: string[];
}

export const KITS: Record<BioKit, Kit> = {
  beleza: {
    id: "beleza",
    icon: Lipstick,
    audience: "business",
    title: "Beleza",
    description: "Salão, manicure, barbearia, estética",
    defaultTheme: "salao",
    themes: ["salao", "ouro-rose", "estetica", "barbearia"],
    namePlaceholder: "Studio Joana Unhas",
    taglinePlaceholder: "Unhas em gel e alongamento, com hora marcada",
    linksPlaceholder: "instagram.com/seuperfil\ng.page/seusalao\n11 91234-5678",
    pixLabel: "Pagar o sinal com Pix",
    offersProducts: false,
    whatsappLabel: "Agendar horário",
    whatsappMessage: "Oi! Vim pela sua bio e quero agendar um horário.\nServiço:\nDia e horário de preferência:",
    contact: { question: "Como agendo um horário?", answer: "Pelo WhatsApp: toque em Agendar horário aqui embaixo e me diga o serviço e o dia que prefere." },
    expressPicks: [0, 1],
    suggestions: [
      { question: "Quanto custa?", hint: "Mão R$ 35, pé R$ 40, gel a partir de R$ 90." },
      { question: "Qual o horário de atendimento?", hint: "De terça a sábado, das 9h às 19h." },
      { question: "Onde fica?", hint: "Rua das Flores, 100, sala 2, Centro." },
      { question: "Precisa pagar sinal?", hint: "Sim, R$ 20 pelo Pix para garantir o horário." },
      { question: "Quais formas de pagamento?", hint: "Pix, dinheiro e cartão." },
      { question: "Atende a domicílio?", hint: "Não, só aqui no estúdio." },
    ],
    matches: ["beleza", "salao", "manicure", "unha", "barbearia", "barbeiro", "estetica", "cabelo", "maquiagem", "sobrancelha", "cilios", "depilacao", "spa", "nail"],
  },
  comida: {
    id: "comida",
    icon: Utensils,
    audience: "business",
    title: "Comida",
    description: "Lanchonete, doceria, restaurante, delivery",
    defaultTheme: "lanchonete",
    themes: ["lanchonete", "confeitaria", "cantina", "cafe"],
    namePlaceholder: "Lanche do Zé",
    taglinePlaceholder: "Hambúrguer artesanal, delivery até as 23h",
    linksPlaceholder: "instagram.com/seulanche\nifood.com.br/seulanche\n11 91234-5678",
    pixLabel: "Pagar com Pix",
    offersProducts: false,
    whatsappLabel: "Fazer pedido",
    whatsappMessage: "Oi! Vim pela sua bio e quero fazer um pedido:\n\nEndereço de entrega:",
    contact: { question: "Como faço um pedido?", answer: "Pelo WhatsApp: toque em Fazer pedido aqui embaixo e mande o que você quer e o endereço." },
    expressPicks: [0, 1],
    suggestions: [
      { question: "Qual o horário de funcionamento?", hint: "Todos os dias, das 18h às 23h." },
      { question: "Vocês entregam no meu bairro?", hint: "Entregamos em até 5 km. Mande o endereço no WhatsApp." },
      { question: "Qual a taxa de entrega?", hint: "R$ 5 até 3 km e R$ 8 até 5 km." },
      { question: "Onde vejo o cardápio?", hint: "No botão Cardápio aqui da bio." },
      { question: "Aceita Pix e cartão?", hint: "Sim: Pix, cartão e dinheiro na entrega." },
      { question: "Tem opção vegetariana?", hint: "Temos o burger de grão-de-bico." },
    ],
    matches: ["comida", "restaurante", "lanchonete", "lanche", "doce", "doceria", "confeitaria", "bolo", "pizza", "pizzaria", "hamburguer", "delivery", "marmita", "cafe", "padaria", "acai", "gastronomia", "food", "bar"],
  },
  artista: {
    id: "artista",
    icon: Mic,
    audience: "creator",
    title: "Artista",
    description: "Música, DJ, banda, cantor",
    defaultTheme: "playlist",
    themes: ["playlist", "neon", "galaxia", "cinema"],
    namePlaceholder: "MC Lua",
    taglinePlaceholder: "Funk e pop. Single novo já nas plataformas",
    linksPlaceholder: "open.spotify.com/artist/...\nyoutube.com/@seucanal\ninstagram.com/seuperfil\n11 91234-5678",
    pixLabel: "Apoie o meu som com um Pix",
    offersProducts: false,
    whatsappLabel: "Contratar show",
    whatsappMessage: "Olá! Vim pela sua bio e quero contratar um show.\nData:\nCidade:\nTipo de evento:",
    contact: { question: "Como contrato um show?", answer: "Pelo WhatsApp: toque em Contratar show aqui embaixo e mande a data, a cidade e o tipo de evento." },
    expressPicks: [0, 1],
    suggestions: [
      { question: "Qual o valor do cachê?", hint: "Depende da data, da cidade e do tempo de show. Mande os detalhes no WhatsApp." },
      { question: "Onde ouço as suas músicas?", hint: "No Spotify, no YouTube e nas outras plataformas, pelos botões aqui da bio." },
      { question: "Quando é o próximo show?", hint: "Sábado, dia 15, no Bar do Centro, às 22h." },
      { question: "Faz show em outras cidades?", hint: "Faço, com transporte e hospedagem por conta do contratante." },
      { question: "Quanto tempo dura o show?", hint: "Uma hora e meia, com músicas próprias e covers." },
      { question: "Tem música nova vindo?", hint: "Tem! O próximo single sai no fim do mês." },
    ],
    matches: ["musica", "musico", "cantor", "cantora", "dj", "banda", "artista", "mc", "rapper", "rap", "sertanejo", "funk", "pagode", "samba", "gospel", "rock", "forro"],
  },
  influencer: {
    id: "influencer",
    icon: UserStar,
    audience: "creator",
    title: "Influencer",
    description: "Publis, parcerias, cupons e mídia kit",
    defaultTheme: "aurora",
    themes: ["aurora", "chiclete", "ouro-rose", "estudio"],
    namePlaceholder: "Ana Souza",
    taglinePlaceholder: "Moda e beleza de verdade, sem filtro",
    linksPlaceholder: "instagram.com/seuperfil\ntiktok.com/@seuperfil\nyoutube.com/@seucanal\n11 91234-5678",
    pixLabel: "Me apoie com um Pix",
    offersProducts: false,
    whatsappLabel: "Fazer publi comigo",
    whatsappMessage: "Olá! Vim pela sua bio e quero fazer uma publi.\nMarca:\nFormato (reels, stories, vídeo):\nPrazo:\nVerba:",
    contact: { question: "Como faço uma publi com você?", answer: "Pelo WhatsApp: toque em Fazer publi comigo aqui embaixo e mande a marca, o formato, o prazo e a verba." },
    expressPicks: [0, 1],
    suggestions: [
      { question: "Você tem cupom de desconto?", hint: "Use ANA10 nas lojas parceiras." },
      { question: "Quanto custa uma publi?", hint: "Depende do formato e do prazo. Mande os detalhes que eu envio o mídia kit." },
      { question: "Qual o produto que você usou no vídeo?", hint: "Está nos links aqui da bio." },
      { question: "Você faz permuta?", hint: "Faço, com marcas que combinam com o meu conteúdo." },
      { question: "Qual o seu público?", hint: "70% mulheres, de 18 a 34 anos, a maioria de SP e RJ." },
      { question: "Onde acho o link do vídeo de ontem?", hint: "Está nos links aqui da bio." },
    ],
    matches: ["influencer", "influenciador", "influenciadora", "criador", "criadora", "creator", "blogueira", "blogueiro", "youtuber", "tiktoker", "moda", "lifestyle", "humor", "fitness"],
  },
  saude: {
    id: "saude",
    icon: Stethoscope,
    audience: "business",
    title: "Saúde e serviços",
    description: "Clínica, personal, nutri, consultoria",
    defaultTheme: "clinica",
    themes: ["clinica", "clean-slate", "menta", "academia"],
    namePlaceholder: "Clínica Sorriso",
    taglinePlaceholder: "Atendimento com hora marcada, de segunda a sábado",
    linksPlaceholder: "instagram.com/suaclinica\ng.page/suaclinica\nsuaclinica.com.br\n11 91234-5678",
    pixLabel: "Pagar com Pix",
    offersProducts: false,
    whatsappLabel: "Marcar horário",
    whatsappMessage: "Olá! Vim pela sua bio e quero marcar um horário.\nNome:\nDia de preferência:",
    contact: { question: "Como marco um horário?", answer: "Pelo WhatsApp: toque em Marcar horário aqui embaixo e diga o dia que prefere." },
    expressPicks: [0, 2],
    suggestions: [
      { question: "Qual o valor da consulta?", hint: "R$ 150 a primeira consulta, com retorno em 30 dias." },
      { question: "Atende por convênio?", hint: "Atendemos Unimed e Bradesco Saúde. Os outros, com reembolso." },
      { question: "Qual o horário de atendimento?", hint: "De segunda a sexta, das 8h às 18h, e sábado até as 12h." },
      { question: "Onde fica?", hint: "Av. Brasil, 500, sala 12." },
      { question: "Tem atendimento online?", hint: "Tem, por videochamada." },
      { question: "Preciso de pedido médico?", hint: "Não precisa para a primeira consulta." },
    ],
    matches: ["saude", "clinica", "medico", "medica", "dentista", "odonto", "nutri", "nutricionista", "psicologo", "psicologa", "psicologia", "fisio", "fisioterapia", "personal", "academia", "consultoria", "advogado", "advocacia", "terapia", "pilates", "veterinario"],
  },
};

const plain = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Kit que combina com o segmento contado no "conhecer você" (ex.: "Salão de beleza" → beleza), ou null. */
export function detectKit(segment?: string | null, audience?: BioAudience | null): BioKit | null {
  const words = new Set(plain(segment ?? "").split(/[^a-z0-9]+/).filter(Boolean));
  if (!words.size) return null;
  const hit = (k: Kit) => k.matches.some((m) => words.has(m));
  const ordered = BIO_KITS.map((id) => KITS[id]).sort((a, b) => Number(b.audience === audience) - Number(a.audience === audience));
  return ordered.find(hit)?.id ?? null;
}

/** O preset que vale para a bio: o do kit, ou o do público quando não há kit. */
export const presetFor = (kit: BioKit | null | undefined, audience: BioAudience | null | undefined): AudiencePreset => (kit ? KITS[kit] : AUDIENCE_PRESETS[audience ?? "business"]);

const DEFAULT_WA_LABEL = "Falar no WhatsApp";

/** O primeiro botão de WhatsApp ainda com o texto padrão ganha o rótulo e a mensagem do kit. */
export function applyKitToLinks(links: LinkItem[], kit: BioKit | null | undefined): LinkItem[] {
  if (!kit) return links;
  const k = KITS[kit];
  let done = false;
  return links.map((l) => {
    if (done || l.kind !== "whatsapp" || l.label !== DEFAULT_WA_LABEL) return l;
    done = true;
    return { ...l, label: k.whatsappLabel, message: k.whatsappMessage };
  });
}
