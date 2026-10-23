/**
 * Contrato do fluxo — espelho de nexo-backend/src/domain/flow/contract.ts.
 * Os campos de `data` gravados aqui são exatamente os que o motor do backend executa.
 */

export const NODE_TYPES = [
  "start",
  "message",
  "question",
  "buttons",
  "image",
  "condition",
  "hours",
  "ai",
  "intent",
  "action",
  "handoff",
  "end",
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const LIMITS = { buttonsMax: 10, buttonLabelMax: 24, intentsMax: 8 } as const;

export const CONDITION_OPERATORS = {
  equals: "é igual a",
  not_equals: "é diferente de",
  contains: "contém",
  not_contains: "não contém",
  starts_with: "começa com",
  greater_than: "é maior que",
  less_than: "é menor que",
  is_empty: "está vazio",
  is_not_empty: "não está vazio",
} as const;
export type ConditionOperator = keyof typeof CONDITION_OPERATORS;

export const QUESTION_VALIDATIONS = {
  none: "Qualquer texto",
  email: "E-mail",
  phone: "Telefone",
  number: "Número",
} as const;
export type QuestionValidation = keyof typeof QUESTION_VALIDATIONS;

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface NodeDataMap {
  start: { label?: string };
  message: { label?: string; content: string };
  question: { label?: string; content: string; variable: string; validation: QuestionValidation; invalidMessage?: string };
  buttons: { label?: string; content: string; options: ChoiceOption[]; variable?: string; invalidMessage?: string };
  image: { label?: string; url: string; caption?: string };
  condition: { label?: string; variable: string; operator: ConditionOperator; value: string };
  hours: { label?: string; timezone: string; days: number[]; start: string; end: string };
  ai: { label?: string; intro?: string; instructions: string; knowledge: string; maxTurns: number };
  intent: { label?: string; variable: string; intents: (ChoiceOption & { description?: string })[] };
  action: { label?: string; url: string; method: "GET" | "POST" | "PUT"; body?: string; saveResponseTo?: string };
  handoff: { label?: string; content: string };
  end: { label?: string };
}

export const OPERATORS_WITHOUT_VALUE: ConditionOperator[] = ["is_empty", "is_not_empty"];
export const VARIABLE_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_.]*$/;
export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/** Id curto e seguro para opções/intenções (vira o handle da saída). */
export const newOptionId = () => `op${Math.random().toString(36).slice(2, 8)}`;

export function defaultNodeData<T extends NodeType>(type: T): NodeDataMap[T] {
  const defaults: { [K in NodeType]: NodeDataMap[K] } = {
    start: { label: "Início" },
    message: { label: "Mensagem", content: "" },
    question: { label: "Pergunta", content: "", variable: "resposta", validation: "none" },
    buttons: {
      label: "Botões",
      content: "Como posso ajudar?",
      options: [
        { id: newOptionId(), label: "Opção 1" },
        { id: newOptionId(), label: "Opção 2" },
      ],
    },
    image: { label: "Imagem", url: "https://" },
    condition: { label: "Condição", variable: "last_input", operator: "equals", value: "" },
    hours: { label: "Horário", timezone: "America/Sao_Paulo", days: [1, 2, 3, 4, 5], start: "08:00", end: "18:00" },
    ai: {
      label: "Agente de IA",
      intro: "Claro! Pode perguntar o que quiser.",
      instructions: "",
      knowledge: "",
      maxTurns: 10,
    },
    intent: {
      label: "Intenção",
      variable: "last_input",
      intents: [
        { id: newOptionId(), label: "Quer comprar" },
        { id: newOptionId(), label: "Precisa de suporte" },
      ],
    },
    action: { label: "Webhook", url: "https://", method: "GET" },
    handoff: { label: "Atendente", content: "Vou te transferir para um atendente. Aguarde só um instante." },
    end: { label: "Fim" },
  };
  return structuredClone(defaults[type]);
}

export interface NodeOutput {
  id: string;
  label?: string;
  /** variável CSS do tema */
  color: string;
}

/** Saídas (handles) de cada bloco — os ids fazem parte do contrato com o motor. */
export function nodeOutputs(type: NodeType, data: Record<string, unknown>, color: string): NodeOutput[] {
  switch (type) {
    case "condition":
      return [
        { id: "yes", label: "Sim", color: "var(--nx-success)" },
        { id: "no", label: "Não", color: "var(--nx-danger)" },
      ];
    case "hours":
      return [
        { id: "open", label: "Aberto", color: "var(--nx-success)" },
        { id: "closed", label: "Fechado", color: "var(--nx-danger)" },
      ];
    case "action":
      return [
        { id: "source", label: "Sucesso", color },
        { id: "error", label: "Erro", color: "var(--nx-danger)" },
      ];
    case "ai":
      return [
        { id: "source", label: "Resolvido", color },
        { id: "handoff", label: "Humano", color: "var(--nx-warning)" },
      ];
    case "buttons":
      return ((data.options as ChoiceOption[]) ?? []).map((o) => ({ id: o.id, label: o.label, color }));
    case "intent":
      return [
        ...((data.intents as ChoiceOption[]) ?? []).map((i) => ({ id: i.id, label: i.label, color })),
        { id: "other", label: "Outro", color: "var(--nx-text-2)" },
      ];
    case "handoff":
    case "end":
      return [];
    default:
      return [{ id: "source", color }];
  }
}
