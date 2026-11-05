/** Espelho do contrato da jornada (nexo-backend/src/domain/bio/journey.ts): tipos e limites. */
export type JourneyTemplateKey = "agendar" | "pedir" | "orcamento" | "contratar" | "duvida" | "produto";
export type JourneyStepKind = "choice" | "text" | "name" | "phone";

export const JOURNEY_MAX = { steps: 6, options: 10, optionLabel: 24, question: 300, stepLabel: 30, answer: 600, greeting: 500, closing: 500, intro: 200, invite: 200, buttonText: 30 } as const;

export interface JourneyOption {
  id: string;
  label: string;
  answer?: string;
}

export interface JourneyStep {
  id: string;
  kind: JourneyStepKind;
  question: string;
  label: string;
  options?: JourneyOption[];
}

export interface JourneySpec {
  template: JourneyTemplateKey;
  greeting: string;
  steps: JourneyStep[];
  closing: string;
  buttonText: string;
  intro: string;
  invite: string;
  phone: string;
}

export type JourneyTemplate = JourneySpec & { title: string; hint: string };

export const STEP_KINDS: { value: JourneyStepKind; label: string }[] = [
  { value: "choice", label: "Botões" },
  { value: "text", label: "Texto livre" },
  { value: "name", label: "Nome" },
  { value: "phone", label: "Telefone" },
];

/** A primeira pendência, em português, para mostrar antes de salvar. */
export function journeyProblem(spec: JourneySpec): string | null {
  const digits = spec.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return "Informe o WhatsApp com DDD.";
  if (!spec.buttonText.trim()) return "Escreva o texto do botão do WhatsApp.";
  if (!spec.steps.length) return "Deixe ao menos uma pergunta.";
  for (const [i, s] of spec.steps.entries()) {
    if (!s.question.trim()) return `Escreva a pergunta ${i + 1}.`;
    if (!s.label.trim()) return `Dê um nome à resposta da pergunta ${i + 1}.`;
    if (s.kind === "choice") {
      if ((s.options?.length ?? 0) < 2) return `A pergunta ${i + 1} precisa de ao menos 2 botões.`;
      if (s.options?.some((o) => !o.label.trim())) return `Escreva o texto dos botões da pergunta ${i + 1}.`;
    }
  }
  return null;
}
