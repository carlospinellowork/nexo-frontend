import { Facebook, type IconComponent, Instagram, TikTok, WhatsApp, XSocial, Youtube } from "../../shared/icons";

export type SocialNetwork = "instagram" | "tiktok" | "whatsapp" | "facebook" | "youtube" | "x";

/** Textos com **negrito** marcado por asteriscos. */
export interface NetworkGuide {
  label: string;
  icon: IconComponent;
  /** Onde abrir a rede (no celular, o link costuma abrir o app). */
  open?: { href: string; label: string };
  openTitle: string;
  /** A tela de edição desenhada, com o campo certo em destaque. */
  mock: { title: string; rows: [label: string, value: string, highlight?: boolean][] };
  whereTitle: string;
  where: string;
  check: string;
  /** Aviso de quando o campo não aparece. */
  note?: string;
}

/**
 * O caminho até o campo de link de cada rede. Nenhuma delas deixa outro app mexer no perfil de ninguém (não há API
 * para isso), então o Nexo deixa o link copiado, abre a rede e mostra onde tocar. Os desenhos não são prints.
 */
export const NETWORKS: Record<SocialNetwork, NetworkGuide> = {
  instagram: {
    label: "Instagram",
    icon: Instagram,
    open: { href: "https://www.instagram.com/accounts/edit/", label: "Abrir o Instagram" },
    openTitle: "Abra o Instagram e toque em Editar perfil",
    mock: {
      title: "Editar perfil",
      rows: [
        ["Nome", "Seu nome"],
        ["Bio", "O texto da bio (aqui o link não fica clicável)"],
        ["Links", "Adicionar link externo", true],
      ],
    },
    whereTitle: "Toque em Links › Adicionar link externo",
    where: `Cole o link no campo **URL**, escreva um título (ex.: “Fale comigo” ou “Agende aqui”) e toque em **Concluir**. Se já tiver outros links, arraste o do Nexo para o primeiro lugar.`,
    check: `O link aparece logo abaixo do texto da bio, com um ícone de corrente. Não cole o link no texto da bio: ali o Instagram não deixa clicar.`,
  },
  tiktok: {
    label: "TikTok",
    icon: TikTok,
    open: { href: "https://www.tiktok.com/", label: "Abrir o TikTok" },
    openTitle: "Abra o TikTok, vá no seu perfil e toque em Editar perfil",
    mock: {
      title: "Editar perfil",
      rows: [
        ["Nome", "Seu nome"],
        ["Bio", "O texto da bio (aqui o link não fica clicável)"],
        ["Site", "Adicionar seu site", true],
      ],
    },
    whereTitle: "Toque em Site, cole o link e salve",
    where: `O endereço aparece clicável logo abaixo da sua bio, para todo mundo que visitar o perfil.`,
    check: `Abra o seu perfil e toque no link para ver a sua bio do Nexo abrindo.`,
    note: `Não aparece o campo **Site**? O TikTok só mostra para contas comerciais (ou com mais seguidores). Mude em **Configurações › Conta › Mudar para conta comercial**: é grátis e leva um minuto.`,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: WhatsApp,
    openTitle: "No WhatsApp Business, abra Configurações › Ferramentas comerciais › Perfil comercial",
    mock: {
      title: "Perfil comercial",
      rows: [
        ["Recado", "Uma frase sobre o negócio"],
        ["Endereço", "Rua, número, cidade"],
        ["Site", "Adicionar site", true],
      ],
    },
    whereTitle: "Toque em Site, cole o link e salve",
    where: `Quem abrir o seu perfil no WhatsApp vê o link e pode tocar nele. Aproveite e ponha o link também na mensagem de saudação.`,
    check: `Peça para alguém abrir o seu perfil numa conversa e tocar no link.`,
    note: `Usa o WhatsApp comum? Ele não tem campo de site. Poste o link no seu **Status** (lá ele fica clicável) e mande para os clientes que perguntarem.`,
  },
  facebook: {
    label: "Facebook",
    icon: Facebook,
    open: { href: "https://www.facebook.com/me", label: "Abrir o Facebook" },
    openTitle: "Abra o Facebook, vá no seu perfil e toque em Editar perfil",
    mock: {
      title: "Editar perfil",
      rows: [
        ["Bio", "Uma frase sobre você"],
        ["Detalhes", "Cidade, trabalho"],
        ["Links", "Adicionar link", true],
      ],
    },
    whereTitle: "Em Links, toque em Adicionar e cole o link",
    where: `Escolha deixar o link visível para **Público** e salve. Numa Página do Facebook, o campo se chama **Site** e fica em Editar Página.`,
    check: `O link aparece na parte de cima do perfil, em Detalhes.`,
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    open: { href: "https://studio.youtube.com/", label: "Abrir o YouTube Studio" },
    openTitle: "Abra o seu canal e toque em Editar (o lápis)",
    mock: {
      title: "Editar canal",
      rows: [
        ["Nome", "Nome do canal"],
        ["Descrição", "Sobre o canal"],
        ["Links", "Adicionar link", true],
      ],
    },
    whereTitle: "Toque em Links › Adicionar link",
    where: `Escreva um título (ex.: “Fale comigo”), cole o link no campo **URL** e salve. No computador, o caminho é YouTube Studio › Personalização › Informações básicas.`,
    check: `O link aparece abaixo do nome do canal. Vale também colar na descrição dos vídeos: ali ele fica clicável.`,
  },
  x: {
    label: "X",
    icon: XSocial,
    open: { href: "https://x.com/settings/profile", label: "Abrir o X" },
    openTitle: "Abra o X, vá no seu perfil e toque em Editar perfil",
    mock: {
      title: "Editar perfil",
      rows: [
        ["Nome", "Seu nome"],
        ["Bio", "O texto da bio"],
        ["Site", "Adicionar site", true],
      ],
    },
    whereTitle: "Toque em Site, cole o link e salve",
    where: `O endereço aparece clicável abaixo da sua bio, com um ícone de corrente.`,
    check: `Abra o seu perfil e toque no link para conferir.`,
  },
};

export const NETWORK_IDS = Object.keys(NETWORKS) as SocialNetwork[];
