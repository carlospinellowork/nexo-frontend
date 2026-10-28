import {
  Bot,
  Clock,
  GitBranch,
  Headset,
  HelpCircle,
  Image,
  ListChecks,
  type LucideIcon,
  MessageCircle,
  MessageSquare,
  Play,
  Sparkles,
  Square,
  Zap,
} from "lucide-react";
import { CONDITION_OPERATORS, type NodeDataMap, type NodeType, OPERATORS_WITHOUT_VALUE, QUESTION_VALIDATIONS, WEEKDAYS } from "./contract";

export interface BlockDefinition {
  type: NodeType;
  name: string;
  description: string;
  icon: LucideIcon;
  /** cor do bloco (variável CSS do tema) */
  color: string;
  group: "Conversa" | "Inteligência" | "Lógica" | "Ações";
  /** precisa da IA configurada no servidor */
  needsAi?: boolean;
}

/** Catálogo dos blocos: biblioteca lateral, cards do canvas e menu "+". */
export const BLOCKS: Record<NodeType, BlockDefinition> = {
  start: { type: "start", name: "Início", description: "Onde a conversa começa", icon: Play, color: "var(--nx-primary)", group: "Conversa" },
  message: { type: "message", name: "Mensagem", description: "Envia um texto", icon: MessageSquare, color: "var(--nx-primary)", group: "Conversa" },
  question: { type: "question", name: "Pergunta", description: "Pergunta e guarda a resposta", icon: HelpCircle, color: "var(--nx-primary)", group: "Conversa" },
  buttons: { type: "buttons", name: "Botões de opção", description: "O cliente escolhe tocando", icon: ListChecks, color: "var(--nx-primary)", group: "Conversa" },
  image: { type: "image", name: "Imagem", description: "Envia uma foto ou arte", icon: Image, color: "var(--nx-primary)", group: "Conversa" },
  ai: { type: "ai", name: "Agente de IA", description: "Responde dúvidas com o seu conteúdo", icon: Bot, color: "var(--nx-accent)", group: "Inteligência", needsAi: true },
  intent: { type: "intent", name: "Entender intenção", description: "Descobre o que o cliente quer", icon: Sparkles, color: "var(--nx-accent)", group: "Inteligência", needsAi: true },
  condition: { type: "condition", name: "Condição", description: "Decide pelo que foi respondido", icon: GitBranch, color: "var(--nx-warning)", group: "Lógica" },
  hours: { type: "hours", name: "Horário de atendimento", description: "Aberto ou fechado agora", icon: Clock, color: "var(--nx-warning)", group: "Lógica" },
  action: { type: "action", name: "Webhook / API", description: "Consulta ou envia para um sistema", icon: Zap, color: "var(--nx-success)", group: "Ações" },
  handoff: { type: "handoff", name: "Falar com humano", description: "Passa a conversa para a equipe", icon: Headset, color: "var(--nx-success)", group: "Ações" },
  whatsapp: { type: "whatsapp", name: "Continuar no WhatsApp", description: "Envia o pedido pronto ao seu WhatsApp", icon: MessageCircle, color: "var(--nx-success)", group: "Ações" },
  end: { type: "end", name: "Fim", description: "Encerra a conversa", icon: Square, color: "var(--nx-danger)", group: "Ações" },
};

export const BLOCK_GROUPS: BlockDefinition["group"][] = ["Conversa", "Inteligência", "Lógica", "Ações"];

/** Blocos que o usuário pode adicionar (o Início é único e já existe). */
export const ADDABLE_BLOCKS = Object.values(BLOCKS).filter((b) => b.type !== "start");

/** Resumo de uma linha mostrado no card do canvas. */
export function blockSummary(type: NodeType, raw: Record<string, unknown>): string {
  const d = raw as never;
  switch (type) {
    case "start":
      return "A conversa começa aqui.";
    case "message":
      return (d as NodeDataMap["message"]).content || "Sem texto";
    case "question": {
      const q = d as NodeDataMap["question"];
      const v = q.validation && q.validation !== "none" ? ` · ${QUESTION_VALIDATIONS[q.validation]}` : "";
      return `${q.content || "Sem pergunta"} (salva em {{${q.variable || "?"}}}${v})`;
    }
    case "buttons":
      return (d as NodeDataMap["buttons"]).content || "Sem pergunta";
    case "image":
      return (d as NodeDataMap["image"]).caption || (d as NodeDataMap["image"]).url || "Sem imagem";
    case "condition": {
      const c = d as NodeDataMap["condition"];
      const value = OPERATORS_WITHOUT_VALUE.includes(c.operator) ? "" : ` "${c.value || "?"}"`;
      return `{{${c.variable || "last_input"}}} ${CONDITION_OPERATORS[c.operator] ?? c.operator}${value}`;
    }
    case "hours": {
      const h = d as NodeDataMap["hours"];
      return `${(h.days ?? []).map((i) => WEEKDAYS[i]).join(", ")} · ${h.start}–${h.end}`;
    }
    case "ai": {
      const a = d as NodeDataMap["ai"];
      return a.knowledge ? `Usa ${a.knowledge.length.toLocaleString("pt-BR")} caracteres de conhecimento` : "Sem conhecimento ainda — adicione o conteúdo da empresa";
    }
    case "intent":
      return `${(d as NodeDataMap["intent"]).intents?.length ?? 0} intenções`;
    case "action": {
      const a = d as NodeDataMap["action"];
      return `${a.method || "GET"} ${a.url || "sem URL"}`;
    }
    case "handoff":
      return (d as NodeDataMap["handoff"]).content || "Transfere para a equipe";
    case "whatsapp": {
      const w = d as NodeDataMap["whatsapp"];
      return w.phone ? `Botão "${w.buttonText || "Continuar no WhatsApp"}"` : "Informe o WhatsApp da empresa";
    }
    case "end":
      return "Encerra a conversa.";
  }
}
