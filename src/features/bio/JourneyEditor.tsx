import { Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useSaveBioJourney } from "../../api/mutations/useBioMutations";
import { useGetJourneyTemplates } from "../../api/queries/useGetJourneyTemplates";
import { Button } from "../../shared/components/ui/Button";
import { selectClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { ArrowDown, ArrowUp, Briefcase, Calendar, ChevronDown, FileText, HelpCircle, type IconComponent, Loader2, MessageCircle, Package, Plus, RefreshCw, Rocket, ShoppingBag, Trash2, TriangleAlert, WhatsApp, X } from "../../shared/icons";
import type { LandingIcon, LandingPageRecord } from "../landing/contract";
import { landingIcon } from "../landing/icons";
import { ImageField } from "../uploads/ImageField";
import { Field } from "../landing/components/SectionEditor";
import { bioUrl } from "./bioUrl";
import { JOURNEY_MAX, journeyProblem, type JourneySpec, type JourneyStep, type JourneyStepKind, type JourneyTemplateKey, STEP_KINDS } from "./journey";
import { JourneyGreetingGuide } from "./JourneyGreetingGuide";

const OPTION_ICONS: LandingIcon[] = ["Sparkles", "Star", "Heart", "Scissors", "Camera", "Utensils", "Truck", "Clock", "Calendar", "MapPin", "Award", "Briefcase"];

const ICONS: Record<JourneyTemplateKey, IconComponent> = { agendar: Calendar, pedir: ShoppingBag, orcamento: FileText, contratar: Briefcase, duvida: HelpCircle, produto: Package };

const newId = () => `s${crypto.randomUUID().slice(0, 7)}`;

function StepCard({ step, index, total, onChange, onMove, onRemove }: { step: JourneyStep; index: number; total: number; onChange: (patch: Partial<JourneyStep>) => void; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  const options = step.options ?? [];
  const setKind = (kind: JourneyStepKind) => onChange({ kind, options: kind === "choice" ? (options.length ? options : [{ id: newId(), label: "" }, { id: newId(), label: "" }]) : undefined });
  const setOption = (id: string, patch: { label?: string; answer?: string; description?: string; imageUrl?: string; icon?: string }) => onChange({ options: options.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border-ui bg-panel-2/60 p-3">
      <div className="flex items-center">
        <span className="flex-1 text-[13px] font-semibold text-text-secondary">Pergunta {index + 1}</span>
        <button type="button" aria-label={`Subir pergunta ${index + 1}`} disabled={index === 0} onClick={() => onMove(-1)} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover disabled:opacity-25">
          <ArrowUp size={16} />
        </button>
        <button type="button" aria-label={`Descer pergunta ${index + 1}`} disabled={index === total - 1} onClick={() => onMove(1)} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover disabled:opacity-25">
          <ArrowDown size={16} />
        </button>
        <button type="button" aria-label={`Remover pergunta ${index + 1}`} disabled={total === 1} onClick={onRemove} className="flex h-11 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/12 hover:text-danger disabled:opacity-25">
          <Trash2 size={16} />
        </button>
      </div>
      <Field label={step.kind === "booking" ? "Frase antes de marcar" : "O que o bot pergunta"} required value={step.question} max={JOURNEY_MAX.question} onChange={(question) => onChange({ question })} />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`kind-${step.id}`} className="text-[13px] font-semibold text-text-secondary">
            Como responde
          </label>
          <select id={`kind-${step.id}`} className={selectClass} value={step.kind} onChange={(e) => setKind(e.target.value as JourneyStepKind)}>
            {STEP_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <Field label="Nome no WhatsApp" required value={step.label} max={JOURNEY_MAX.stepLabel} onChange={(label) => onChange({ label })} />
      </div>
      {step.kind === "booking" && (
        <p className="text-[13px] leading-snug text-text-secondary">
          O bot pergunta serviço, dia, horário livre, nome e WhatsApp e já reserva. Os serviços e horários ficam na{" "}
          <Link to="/agenda" className="font-semibold text-primary-strong underline">
            Agenda
          </Link>
          .
        </p>
      )}
      {step.kind === "choice" && (
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-secondary">Botões</span>
          {options.map((o, i) => (
            <div key={o.id} className="flex flex-col gap-1.5 rounded-xl border border-border-ui bg-panel p-2">
              <div className="flex items-center gap-1">
                <div className="min-w-0 flex-1">
                  <Field label={`Botão ${i + 1}`} required value={o.label} max={JOURNEY_MAX.optionLabel} onChange={(label) => setOption(o.id, { label })} />
                </div>
                <button type="button" aria-label={`Remover botão ${i + 1}`} disabled={options.length <= 2} onClick={() => onChange({ options: options.filter((x) => x.id !== o.id) })} className="mt-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-danger/12 hover:text-danger disabled:opacity-25">
                  <X size={18} />
                </button>
              </div>
              <Field label="Resposta ao tocar (opcional)" value={o.answer} max={JOURNEY_MAX.answer} placeholder="Ex.: preço ou explicação" onChange={(answer) => setOption(o.id, { answer: answer || undefined })} />
              <details className="group rounded-xl">
                <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1 text-[13px] font-semibold text-primary-strong">
                  <ChevronDown size={14} className="transition-transform group-open:rotate-180" /> Deixar com cara de cartão
                </summary>
                <div className="flex flex-col gap-2 pt-1.5">
                  <Field label="Descrição curta" value={o.description} max={200} placeholder="Ex.: Com lavagem e finalização" onChange={(description) => setOption(o.id, { description: description || undefined })} />
                  <ImageField label="Foto" value={o.imageUrl} shape="wide" onChange={(imageUrl) => setOption(o.id, { imageUrl })} />
                  <span className="text-[13px] font-semibold text-text-secondary">Ou um ícone</span>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Ícone do botão ${i + 1}`}>
                    {OPTION_ICONS.map((name) => {
                      const Icon = landingIcon(name);
                      return (
                        <button key={name} type="button" role="radio" aria-checked={o.icon === name} aria-label={name} onClick={() => setOption(o.id, { icon: o.icon === name ? undefined : name })} className={`flex h-10 w-10 items-center justify-center rounded-lg border ${o.icon === name ? "border-primary bg-primary/12 text-primary-strong" : "border-border-ui text-text-secondary"}`}>
                          <Icon size={17} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </details>
            </div>
          ))}
          {options.length < JOURNEY_MAX.options && (
            <button type="button" onClick={() => onChange({ options: [...options, { id: newId(), label: "" }] })} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-ui text-[14px] font-semibold text-primary-strong">
              <Plus size={14} /> Outro botão
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Jornada sem editor de fluxo: escolhe um modelo, troca os textos e salva. Vai ao ar na hora. */
export function JourneyEditor({ page, ensureSaved, onSaved }: { page: LandingPageRecord; ensureSaved: () => Promise<boolean>; onSaved: (page: LandingPageRecord) => void }) {
  const saved = page.settings.bio?.journey;
  const live = page.settings.bio?.botMode === "journey";
  const [spec, setSpec] = useState<JourneySpec | null>(saved ?? null);
  const [picking, setPicking] = useState(!saved);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [guide, setGuide] = useState(false);
  const { data: templates, isLoading } = useGetJourneyTemplates(page.id, picking);
  const { mutateAsync: save, isPending } = useSaveBioJourney();
  const problem = spec && journeyProblem(spec);

  const patch = (p: Partial<JourneySpec>) => setSpec((s) => (s ? { ...s, ...p } : s));
  const setSteps = (fn: (steps: JourneyStep[]) => JourneyStep[]) => setSpec((s) => (s ? { ...s, steps: fn(s.steps) } : s));
  const move = (i: number, dir: -1 | 1) =>
    setSteps((steps) => {
      const next = [...steps];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });

  const run = async (force: boolean) => {
    if (!spec || !(await ensureSaved())) return;
    try {
      const result = await save({ pageId: page.id, journey: spec, force });
      setNeedsConfirm(false);
      onSaved(result.page);
      toast.success("Jornada no ar. A sua bio já abre nela.");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409 && (err.response.data as { details?: { code?: string } })?.details?.code === "FLOW_EDITED") {
        setNeedsConfirm(true);
        return;
      }
      toast.error(apiErrorMessage(err, "Não foi possível salvar a jornada."));
    }
  };

  if (picking) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[14px] leading-snug text-text-secondary">Escolha o que a pessoa vem fazer. Depois é só trocar os textos pelos seus.</p>
        {isLoading && <Loader2 size={24} className="mx-auto animate-spin text-primary" />}
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-1">
          {templates?.map((t) => {
            const Icon = ICONS[t.template];
            return (
              <button
                key={t.template}
                type="button"
                onClick={() => {
                  setSpec(t);
                  setPicking(false);
                }}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-border-ui bg-panel p-2.5 text-left hover:bg-panel-hover"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon size={18} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[14px] font-semibold text-text-primary">{t.title}</span>
                  <span className="text-[12.5px] leading-snug text-text-secondary">{t.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
        {spec && (
          <Button variant="outline" onClick={() => setPicking(false)} className="h-11">
            Voltar sem trocar
          </Button>
        )}
      </div>
    );
  }

  if (!spec) return null;

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={() => setPicking(true)} className="flex min-h-11 items-center gap-1.5 self-start text-[14px] font-semibold text-primary-strong">
        <RefreshCw size={15} /> Trocar de modelo
      </button>
      <Field label="Saudação" multiline value={spec.greeting} max={JOURNEY_MAX.greeting} onChange={(greeting) => patch({ greeting })} />
      {spec.steps.map((step, i) => (
        <StepCard key={step.id} step={step} index={i} total={spec.steps.length} onChange={(p) => setSteps((all) => all.map((s) => (s.id === step.id ? { ...s, ...p } : s)))} onMove={(dir) => move(i, dir)} onRemove={() => setSteps((all) => all.filter((s) => s.id !== step.id))} />
      ))}
      {spec.steps.length < JOURNEY_MAX.steps && (
        <button type="button" onClick={() => setSteps((all) => [...all, { id: newId(), kind: "text", question: "", label: "" }])} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-ui text-[14px] font-semibold text-primary-strong">
          <Plus size={14} /> Outra pergunta
        </button>
      )}

      <div className="flex flex-col gap-2.5 rounded-2xl border border-border-ui bg-panel-2/60 p-3">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary">
          <WhatsApp size={15} /> Fim no WhatsApp
        </span>
        <Field label="Seu WhatsApp, com DDD" required value={spec.phone} max={20} inputMode="tel" onChange={(phone) => patch({ phone })} />
        <Field label="Última mensagem do bot" multiline value={spec.closing} max={JOURNEY_MAX.closing} onChange={(closing) => patch({ closing })} />
        <Field label="Texto do botão" required value={spec.buttonText} max={JOURNEY_MAX.buttonText} onChange={(buttonText) => patch({ buttonText })} />
        <Field label="Primeira linha da mensagem que você recebe" value={spec.intro} max={JOURNEY_MAX.intro} onChange={(intro) => patch({ intro })} />
      </div>

      {needsConfirm && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl bg-warning/14 p-3 text-[13px] leading-snug text-warning-strong">
          <span className="flex gap-2">
            <TriangleAlert size={16} className="mt-px shrink-0" />O fluxo deste bot foi editado no construtor. A jornada substitui essas edições.
          </span>
          <div className="flex flex-col gap-2 min-[420px]:flex-row">
            <Button variant="danger" onClick={() => void run(true)} loading={isPending} className="min-h-11 flex-1">
              Substituir mesmo assim
            </Button>
            <Button variant="outline" onClick={() => setNeedsConfirm(false)} className="min-h-11 flex-1">
              Manter como está
            </Button>
          </div>
        </div>
      )}

      {problem && <p className="text-[13px] font-semibold text-warning-strong">{problem}</p>}
      <Button size="lg" icon={Rocket} onClick={() => void run(false)} loading={isPending && !needsConfirm} disabled={Boolean(problem) || needsConfirm}>
        {live ? "Salvar e pôr no ar" : "Usar esta jornada"}
      </Button>
      <p className="text-[13px] leading-snug text-text-secondary">Vai ao ar na hora e a bio passa a abrir nesta conversa.</p>

      {live && page.publishedAt && (
        <Button variant="outline" icon={MessageCircle} className="h-11" onClick={() => setGuide(true)}>
          Pôr na saudação do WhatsApp
        </Button>
      )}
      {guide && <JourneyGreetingGuide url={bioUrl(page.slug)} invite={spec.invite} onClose={() => setGuide(false)} />}
    </div>
  );
}
