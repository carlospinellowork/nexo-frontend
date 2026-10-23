import { Instagram, type LucideIcon, MessageCircle, Send } from "lucide-react";
import type { ChannelType } from "../../api/queries/useGetIntegrations";

export interface ChannelField {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  optional?: boolean;
  hint?: string;
}

export interface ChannelDefinition {
  type: ChannelType;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  /** precisa de webhook público da Meta (PUBLIC_API_URL https + app Meta configurado) */
  needsMeta: boolean;
  fields: ChannelField[];
  steps: string[];
  /** como exibir a conta conectada a partir de Integration.config */
  describe: (config: Record<string, string>) => string;
}

export const CHANNELS: ChannelDefinition[] = [
  {
    type: "whatsapp",
    name: "WhatsApp",
    description: "API oficial (WhatsApp Cloud API da Meta). Sem risco de banimento do número.",
    icon: MessageCircle,
    color: "#25D366",
    needsMeta: true,
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "Ex.: 106540352242922" },
      {
        key: "accessToken",
        label: "Token de acesso",
        placeholder: "EAAG...",
        secret: true,
        hint: "Use um token permanente de Usuário do Sistema (o token temporário expira em 24h).",
      },
      { key: "wabaId", label: "WhatsApp Business Account ID", placeholder: "Ex.: 102290129340398", optional: true, hint: "Necessário para o Nexo receber as mensagens desse número." },
    ],
    steps: [
      "Acesse developers.facebook.com, crie (ou abra) um app do tipo Empresa e adicione o produto WhatsApp.",
      "Em WhatsApp → Configuração da API, copie o Phone Number ID e o WhatsApp Business Account ID.",
      "Em Configurações do negócio → Usuários do sistema, gere um token permanente com as permissões whatsapp_business_messaging e whatsapp_business_management.",
      "Cole os dados abaixo e clique em Conectar. Para testar, use o número de teste gratuito que a Meta oferece.",
    ],
    describe: (c) => [c.verifiedName, c.displayPhoneNumber].filter(Boolean).join(" · "),
  },
  {
    type: "instagram",
    name: "Instagram Direct",
    description: "Responda automaticamente as mensagens do Direct de uma conta profissional.",
    icon: Instagram,
    color: "#E1306C",
    needsMeta: true,
    fields: [
      {
        key: "accessToken",
        label: "Token de acesso do Instagram",
        placeholder: "IGAA...",
        secret: true,
        hint: "Token da API do Instagram com Login do Instagram, com a permissão instagram_business_manage_messages.",
      },
    ],
    steps: [
      "A conta do Instagram precisa ser Profissional (Empresa ou Criador de conteúdo).",
      "No app Meta do Nexo, adicione o produto Instagram → API com Login do Instagram.",
      "Gere um token para a conta com as permissões instagram_business_basic e instagram_business_manage_messages.",
      "No app do Instagram, ative Configurações → Mensagens → Permitir acesso às mensagens.",
    ],
    describe: (c) => (c.username ? `@${c.username}` : ""),
  },
  {
    type: "telegram",
    name: "Telegram",
    description: "Conecte um bot do Telegram em segundos — ótimo para testar.",
    icon: Send,
    color: "#229ED9",
    needsMeta: false,
    fields: [{ key: "token", label: "Token do bot", placeholder: "123456789:ABCdefGhIJKlmNoPQRstuVWXyz", secret: true }],
    steps: [
      "No Telegram, abra uma conversa com @BotFather.",
      "Envie /newbot, escolha um nome e um usuário terminado em 'bot'.",
      "Copie o token que o BotFather enviar e cole abaixo.",
    ],
    describe: (c) => (c.username ? `@${c.username}` : c.botName ?? ""),
  },
];
