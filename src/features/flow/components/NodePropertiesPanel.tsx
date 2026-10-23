import { ArrowDown, ArrowUp, Plus, Trash2, TriangleAlert, X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useGetAiStatus } from "../../../api/queries/useGetAiStatus";
import { inputClass, selectClass, textareaClass } from "../../../shared/components/ui/styles";
import { BLOCKS } from "../catalog";
import {
  type ChoiceOption,
  CONDITION_OPERATORS,
  type ConditionOperator,
  LIMITS,
  type NodeDataMap,
  type NodeType,
  newOptionId,
  OPERATORS_WITHOUT_VALUE,
  QUESTION_VALIDATIONS,
  type QuestionValidation,
  VARIABLE_PATTERN,
  WEEKDAYS,
} from "../contract";
import { useFlowStore } from "../store/flow.store";

function Field({ label, hint, error, children }: { label: string; hint?: ReactNode; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
      {children}
      {error ? <span className="text-[12px] text-danger-strong">{error}</span> : hint && <span className="text-[12px] leading-snug text-text-secondary">{hint}</span>}
    </label>
  );
}

function Note({ tone = "info", children }: { tone?: "info" | "warning"; children: ReactNode }) {
  return (
    <p className={`flex gap-2 rounded-2xl p-3 text-[13px] leading-snug ${tone === "warning" ? "bg-warning/14 text-warning-strong" : "bg-primary/10 text-text-primary"}`}>
      {tone === "warning" && <TriangleAlert size={16} className="mt-px shrink-0" />}
      <span>{children}</span>
    </p>
  );
}

const variableError = (v: string | undefined) =>
  v && !VARIABLE_PATTERN.test(v) ? "Use só letras, números e _ (sem espaços ou acentos)" : undefined;

const VARIABLE_HINT = (
  <>
    Use <code className="text-primary-strong">{"{{nome}}"}</code> para inserir respostas anteriores.
  </>
);

type SetData = (data: Record<string, unknown>) => void;

export function NodePropertiesPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, deleteNode, testOpen } = useFlowStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const type = node.type as NodeType;
  const def = BLOCKS[type];
  const set: SetData = (data) => updateNodeData(node.id, data);
  const variables = nodes
    .flatMap((n) => [n.type === "question" ? (n.data as NodeDataMap["question"]).variable : undefined, n.type === "buttons" ? (n.data as NodeDataMap["buttons"]).variable : undefined])
    .filter((v): v is string => Boolean(v));

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={`absolute bottom-4 top-4 z-50 flex w-[360px] ${testOpen ? "right-[392px]" : "right-4"} flex-col overflow-hidden rounded-3xl border border-border-ui bg-panel shadow-float`}
    >
      <div className="flex items-center gap-3 border-b border-border-ui px-5 py-4">
        {def && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${def.color} 14%, transparent)`, color: def.color }}>
            <def.icon size={18} />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-[16px] font-bold text-text-primary">{def?.name ?? type}</h3>
          <span className="truncate text-[12px] text-text-secondary">{def?.description}</span>
        </div>
        <button onClick={() => setSelectedNodeId(null)} className="rounded-lg p-1.5 text-text-secondary hover:bg-panel-hover" aria-label="Fechar">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <Field label="Nome do bloco" hint="Só para você se organizar; o cliente não vê.">
          <input className={inputClass} value={String(node.data.label ?? "")} onChange={(e) => set({ label: e.target.value })} />
        </Field>

        {type === "start" && <Note>Todo fluxo começa aqui. Use o “+” abaixo do bloco para adicionar o primeiro passo.</Note>}
        {type === "end" && <Note>Encerra a conversa. Se o cliente escrever de novo, o fluxo recomeça do início.</Note>}

        {type === "message" && (
          <Field label="Mensagem" hint={VARIABLE_HINT}>
            <textarea className={`${textareaClass} h-32`} value={String(node.data.content ?? "")} onChange={(e) => set({ content: e.target.value })} placeholder="O que o assistente deve dizer?" />
          </Field>
        )}
        {type === "question" && <QuestionFields data={node.data as NodeDataMap["question"]} set={set} />}
        {type === "buttons" && <ButtonsFields nodeId={node.id} data={node.data as NodeDataMap["buttons"]} set={set} />}
        {type === "image" && <ImageFields data={node.data as NodeDataMap["image"]} set={set} />}
        {type === "condition" && <ConditionFields data={node.data as NodeDataMap["condition"]} set={set} variables={variables} />}
        {type === "hours" && <HoursFields data={node.data as NodeDataMap["hours"]} set={set} />}
        {type === "ai" && <AiFields data={node.data as NodeDataMap["ai"]} set={set} />}
        {type === "intent" && <IntentFields nodeId={node.id} data={node.data as NodeDataMap["intent"]} set={set} variables={variables} />}
        {type === "action" && <ActionFields data={node.data as NodeDataMap["action"]} set={set} />}
        {type === "handoff" && (
          <>
            <Field label="Mensagem antes de transferir" hint={VARIABLE_HINT}>
              <textarea className={`${textareaClass} h-24`} value={String(node.data.content ?? "")} onChange={(e) => set({ content: e.target.value })} />
            </Field>
            <Note>Depois deste bloco o assistente para de responder e a conversa fica marcada como “transferida”. A caixa de entrada da equipe chega em uma próxima versão.</Note>
          </>
        )}
      </div>

      {type !== "start" && (
        <div className="border-t border-border-ui p-4">
          <button
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-danger/10 text-[14px] font-semibold text-danger-strong transition-colors hover:bg-danger/16"
            onClick={() => deleteNode(node.id)}
          >
            <Trash2 size={16} /> Excluir bloco
          </button>
        </div>
      )}
    </motion.div>
  );
}

/** Remove as ligações que saíam de uma opção apagada. */
function dropEdgesFrom(nodeId: string, handle: string) {
  useFlowStore.setState((s) => ({ edges: s.edges.filter((e) => !(e.source === nodeId && e.sourceHandle === handle)) }));
}

function OptionsEditor({
  nodeId,
  items,
  max,
  maxLabel,
  withDescription,
  onChange,
  addLabel,
}: {
  nodeId: string;
  items: (ChoiceOption & { description?: string })[];
  max: number;
  maxLabel: number;
  withDescription?: boolean;
  onChange: (items: (ChoiceOption & { description?: string })[]) => void;
  addLabel: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex flex-col gap-1.5 rounded-2xl bg-panel-2 p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-5 text-center text-[12px] font-bold text-text-secondary">{i + 1}</span>
            <input
              className="h-9 min-w-0 flex-1 rounded-lg border border-border-ui bg-panel px-2.5 text-[14px] text-text-primary outline-none focus:border-primary"
              value={item.label}
              maxLength={maxLabel}
              onChange={(e) => onChange(items.map((it) => (it.id === item.id ? { ...it, label: e.target.value } : it)))}
              aria-label={`Opção ${i + 1}`}
            />
            <span className={`w-9 text-right text-[11px] tabular-nums ${item.label.length >= maxLabel ? "text-warning-strong" : "text-text-secondary"}`}>
              {item.label.length}/{maxLabel}
            </span>
            <div className="flex">
              <button className="rounded-md p-1 text-text-secondary hover:bg-panel-hover disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">
                <ArrowUp size={14} />
              </button>
              <button className="rounded-md p-1 text-text-secondary hover:bg-panel-hover disabled:opacity-30" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Descer">
                <ArrowDown size={14} />
              </button>
              <button
                className="rounded-md p-1 text-text-secondary hover:bg-danger/12 hover:text-danger disabled:opacity-30"
                disabled={items.length <= 1}
                onClick={() => {
                  dropEdgesFrom(nodeId, item.id);
                  onChange(items.filter((it) => it.id !== item.id));
                }}
                aria-label="Remover"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {withDescription && (
            <input
              className="ml-[26px] h-8 rounded-lg border border-border-ui bg-panel px-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-primary"
              value={item.description ?? ""}
              placeholder="Exemplos: “quero comprar”, “tem disponível?”"
              onChange={(e) => onChange(items.map((it) => (it.id === item.id ? { ...it, description: e.target.value } : it)))}
            />
          )}
        </div>
      ))}
      {items.length < max && (
        <button
          onClick={() => onChange([...items, { id: newOptionId(), label: `Opção ${items.length + 1}` }])}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-ui text-[13px] font-semibold text-primary-strong hover:bg-primary/8"
        >
          <Plus size={15} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function QuestionFields({ data, set }: { data: NodeDataMap["question"]; set: SetData }) {
  return (
    <>
      <Field label="Pergunta" hint="O assistente envia e espera a resposta do cliente.">
        <textarea className={`${textareaClass} h-24`} value={data.content ?? ""} onChange={(e) => set({ content: e.target.value })} placeholder="Ex.: Qual é o seu nome?" />
      </Field>
      <Field label="Salvar resposta em" error={variableError(data.variable)} hint={<>Depois use <code className="text-primary-strong">{`{{${data.variable || "variavel"}}}`}</code>.</>}>
        <input className={`${inputClass} font-mono`} value={data.variable ?? ""} onChange={(e) => set({ variable: e.target.value.trim() })} placeholder="nome" />
      </Field>
      <Field label="Tipo de resposta esperada">
        <select className={selectClass} value={data.validation ?? "none"} onChange={(e) => set({ validation: e.target.value as QuestionValidation })}>
          {Object.entries(QUESTION_VALIDATIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      {data.validation && data.validation !== "none" && (
        <Field label="Mensagem se a resposta for inválida" hint="Opcional. Há uma mensagem padrão.">
          <input className={inputClass} value={data.invalidMessage ?? ""} onChange={(e) => set({ invalidMessage: e.target.value })} />
        </Field>
      )}
    </>
  );
}

function ButtonsFields({ nodeId, data, set }: { nodeId: string; data: NodeDataMap["buttons"]; set: SetData }) {
  return (
    <>
      <Field label="Pergunta" hint={VARIABLE_HINT}>
        <textarea className={`${textareaClass} h-20`} value={data.content ?? ""} onChange={(e) => set({ content: e.target.value })} placeholder="Ex.: Como posso ajudar?" />
      </Field>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-text-secondary">Opções</span>
        <OptionsEditor
          nodeId={nodeId}
          items={data.options ?? []}
          max={LIMITS.buttonsMax}
          maxLabel={LIMITS.buttonLabelMax}
          onChange={(options) => set({ options })}
          addLabel="Adicionar opção"
        />
        <span className="text-[12px] leading-snug text-text-secondary">
          No WhatsApp, até 3 opções aparecem como botões; com mais, viram uma lista. Cada opção é uma saída do bloco.
        </span>
      </div>
      <Field label="Salvar escolha em (opcional)" error={variableError(data.variable)}>
        <input className={`${inputClass} font-mono`} value={data.variable ?? ""} onChange={(e) => set({ variable: e.target.value.trim() || undefined })} placeholder="servico" />
      </Field>
    </>
  );
}

function ImageFields({ data, set }: { data: NodeDataMap["image"]; set: SetData }) {
  const valid = /^https:\/\/\S+$/.test(data.url ?? "");
  return (
    <>
      <Field label="Endereço da imagem (https)" hint="JPG ou PNG publicado na internet (ex.: do seu site ou Google Drive público).">
        <input className={`${inputClass} font-mono text-[13px]`} value={data.url ?? ""} onChange={(e) => set({ url: e.target.value.trim() })} placeholder="https://" />
      </Field>
      {valid && (
        <div className="overflow-hidden rounded-2xl border border-border-ui bg-panel-2">
          <img src={data.url} alt="Prévia" className="max-h-48 w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        </div>
      )}
      <Field label="Legenda (opcional)" hint={VARIABLE_HINT}>
        <input className={inputClass} value={data.caption ?? ""} onChange={(e) => set({ caption: e.target.value || undefined })} />
      </Field>
    </>
  );
}

function ConditionFields({ data, set, variables }: { data: NodeDataMap["condition"]; set: SetData; variables: string[] }) {
  const options = Array.from(new Set(["last_input", "last_choice", ...variables, data.variable].filter(Boolean)));
  return (
    <>
      <Field label="Verificar">
        <select className={`${selectClass} font-mono`} value={data.variable || "last_input"} onChange={(e) => set({ variable: e.target.value })}>
          {options.map((v) => (
            <option key={v} value={v}>
              {v === "last_input" ? "Última mensagem do cliente" : v === "last_choice" ? "Último botão escolhido" : `{{${v}}}`}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Regra">
        <select className={selectClass} value={data.operator ?? "equals"} onChange={(e) => set({ operator: e.target.value as ConditionOperator })}>
          {Object.entries(CONDITION_OPERATORS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      {!OPERATORS_WITHOUT_VALUE.includes(data.operator) && (
        <Field label="Valor" hint="Separe alternativas por vírgula: sim, s, quero. Maiúsculas e acentos são ignorados.">
          <input className={inputClass} value={data.value ?? ""} onChange={(e) => set({ value: e.target.value })} placeholder="sim, s, quero" />
        </Field>
      )}
    </>
  );
}

function HoursFields({ data, set }: { data: NodeDataMap["hours"]; set: SetData }) {
  const days = data.days ?? [];
  const toggle = (d: number) => set({ days: days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort() });
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-text-secondary">Dias de atendimento</span>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((label, d) => (
            <button
              key={label}
              onClick={() => toggle(d)}
              aria-pressed={days.includes(d)}
              className={`h-9 rounded-lg text-[12px] font-semibold transition-colors ${days.includes(d) ? "bg-primary text-white" : "bg-panel-2 text-text-secondary hover:bg-panel-hover"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Abre às">
          <input type="time" className={inputClass} value={data.start} onChange={(e) => set({ start: e.target.value })} />
        </Field>
        <Field label="Fecha às">
          <input type="time" className={inputClass} value={data.end} onChange={(e) => set({ end: e.target.value })} />
        </Field>
      </div>
      <Field label="Fuso horário">
        <select className={selectClass} value={data.timezone} onChange={(e) => set({ timezone: e.target.value })}>
          <option value="America/Sao_Paulo">Brasília (São Paulo, Rio, Sul, Nordeste)</option>
          <option value="America/Manaus">Amazonas (Manaus)</option>
          <option value="America/Cuiaba">Mato Grosso (Cuiabá)</option>
          <option value="America/Rio_Branco">Acre (Rio Branco)</option>
          <option value="America/Noronha">Fernando de Noronha</option>
        </select>
      </Field>
      <Note>Saída “Aberto” no horário de atendimento e “Fechado” fora dele.</Note>
    </>
  );
}

function AiFields({ data, set }: { data: NodeDataMap["ai"]; set: SetData }) {
  const { data: ai } = useGetAiStatus();
  return (
    <>
      {ai && !ai.configured && (
        <Note tone="warning">A IA ainda não está ligada neste servidor. Sem ela, o bloco avisa o cliente e segue pela saída “Humano”.</Note>
      )}
      <Field label="Mensagem de abertura" hint="Enviada ao entrar no bloco. O agente então responde cada pergunta do cliente.">
        <input className={inputClass} value={data.intro ?? ""} onChange={(e) => set({ intro: e.target.value })} />
      </Field>
      <Field label="Como o agente deve agir" hint="Tom de voz, o que pode e o que não pode responder.">
        <textarea className={`${textareaClass} h-24`} value={data.instructions ?? ""} onChange={(e) => set({ instructions: e.target.value })} placeholder="Ex.: Seja simpático, trate por você e sempre ofereça agendar uma avaliação." />
      </Field>
      <Field label={`Conhecimento da empresa (${(data.knowledge ?? "").length.toLocaleString("pt-BR")}/30.000)`} hint="Cole preços, serviços, endereço, horários, perguntas frequentes. O agente só responde com base nisso.">
        <textarea className={`${textareaClass} h-48 text-[13px]`} maxLength={30000} value={data.knowledge ?? ""} onChange={(e) => set({ knowledge: e.target.value })} />
      </Field>
      <Field label="Limite de respostas" hint="Depois disso a conversa segue pela saída “Resolvido”.">
        <input type="number" min={1} max={30} className={inputClass} value={data.maxTurns ?? 10} onChange={(e) => set({ maxTurns: Math.min(30, Math.max(1, Number(e.target.value) || 1)) })} />
      </Field>
    </>
  );
}

function IntentFields({ nodeId, data, set, variables }: { nodeId: string; data: NodeDataMap["intent"]; set: SetData; variables: string[] }) {
  const { data: ai } = useGetAiStatus();
  const options = Array.from(new Set(["last_input", ...variables, data.variable].filter(Boolean)));
  return (
    <>
      {ai && !ai.configured && <Note tone="warning">A IA ainda não está ligada neste servidor. Sem ela, este bloco sempre segue pela saída “Outro”.</Note>}
      <Field label="Analisar">
        <select className={`${selectClass} font-mono`} value={data.variable || "last_input"} onChange={(e) => set({ variable: e.target.value })}>
          {options.map((v) => (
            <option key={v} value={v}>
              {v === "last_input" ? "Última mensagem do cliente" : `{{${v}}}`}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-text-secondary">Intenções</span>
        <OptionsEditor
          nodeId={nodeId}
          items={data.intents ?? []}
          max={LIMITS.intentsMax}
          maxLabel={60}
          withDescription
          onChange={(intents) => set({ intents })}
          addLabel="Adicionar intenção"
        />
        <span className="text-[12px] leading-snug text-text-secondary">Cada intenção vira uma saída. Quando nenhuma combina, segue por “Outro”.</span>
      </div>
    </>
  );
}

function ActionFields({ data, set }: { data: NodeDataMap["action"]; set: SetData }) {
  return (
    <>
      <Field label="URL" hint={<>Pode usar variáveis no caminho: https://api.loja.com/pedidos/{"{{pedido}}"}</>}>
        <input className={`${inputClass} font-mono text-[13px]`} value={data.url ?? ""} onChange={(e) => set({ url: e.target.value })} placeholder="https://" />
      </Field>
      <Field label="Método">
        <select className={selectClass} value={data.method ?? "GET"} onChange={(e) => set({ method: e.target.value })}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
        </select>
      </Field>
      {data.method !== "GET" && (
        <Field label="Corpo (JSON)" hint="Ex.: {&quot;nome&quot;: &quot;{{nome}}&quot;}">
          <textarea className={`${textareaClass} h-24 font-mono text-[13px]`} value={data.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
        </Field>
      )}
      <Field label="Salvar resposta em" error={variableError(data.saveResponseTo)} hint="Opcional. Campos do JSON viram variáveis: {{resposta.status}}">
        <input className={`${inputClass} font-mono`} value={data.saveResponseTo ?? ""} onChange={(e) => set({ saveResponseTo: e.target.value.trim() || undefined })} placeholder="resposta" />
      </Field>
    </>
  );
}
