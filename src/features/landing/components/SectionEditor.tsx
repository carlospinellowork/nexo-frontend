import { ArrowDown, ArrowUp, Plus, Star, Trash2, TriangleAlert } from "lucide-react";
import { type ReactNode, useId } from "react";
import { inputClass, selectClass, textareaClass } from "../../../shared/components/ui/styles";
import {
  type CtaData,
  type FaqItem,
  type FeatureItem,
  type FooterData,
  type HeroData,
  LANDING_ICONS,
  type LandingIcon,
  type LandingSection,
  MAX,
  type ServiceItem,
  type TestimonialItem,
} from "../contract";
import { landingIcon } from "../icons";

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 6)}`;

function Field({ label, value, max, onChange, multiline, placeholder, required }: { label: string; value: string | undefined; max: number; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; required?: boolean }) {
  const id = useId();
  const length = value?.length ?? 0;
  const empty = required && !value?.trim();
  const props = {
    id,
    value: value ?? "",
    maxLength: max,
    placeholder,
    "aria-invalid": empty || undefined,
    "aria-describedby": empty ? `${id}-error` : undefined,
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-text-secondary">
          {label}
        </label>
        {length > max * 0.8 && <span className={`text-[11px] tabular-nums ${length >= max ? "text-warning-strong" : "text-text-secondary"}`}>{length}/{max}</span>}
      </div>
      {multiline ? (
        <textarea {...props} className={`${textareaClass} min-h-20 text-[14px] ${empty ? "border-danger" : ""}`} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...props} className={`${inputClass} h-10 text-[14px] ${empty ? "border-danger" : ""}`} onChange={(e) => onChange(e.target.value)} />
      )}
      {empty && (
        <span id={`${id}-error`} className="text-[12px] text-danger-strong">
          Campo obrigatório
        </span>
      )}
    </div>
  );
}

/** Lista editável de itens (serviços, diferenciais, depoimentos, perguntas). */
function ItemList<T extends { id: string }>({ items, max, min = 1, noun, onChange, create, render }: {
  items: T[];
  max: number;
  min?: number;
  noun: string;
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex flex-col gap-2.5 rounded-2xl border border-border-ui bg-panel p-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-text-secondary">
              {noun} {i + 1}
            </span>
            <div className="flex">
              <button type="button" className="rounded-md p-1 text-text-secondary hover:bg-panel-hover disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">
                <ArrowUp size={14} />
              </button>
              <button type="button" className="rounded-md p-1 text-text-secondary hover:bg-panel-hover disabled:opacity-30" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Descer">
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                className="rounded-md p-1 text-text-secondary hover:bg-danger/12 hover:text-danger disabled:opacity-30"
                disabled={items.length <= min}
                onClick={() => onChange(items.filter((it) => it.id !== item.id))}
                aria-label={`Remover ${noun.toLowerCase()} ${i + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {render(item, (patch) => onChange(items.map((it) => (it.id === item.id ? { ...it, ...patch } : it))))}
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-ui text-[13px] font-semibold text-primary-strong hover:bg-primary/8"
        >
          <Plus size={15} /> Adicionar {noun.toLowerCase()}
        </button>
      )}
    </div>
  );
}

function IconSelect({ value, onChange }: { value: LandingIcon; onChange: (icon: LandingIcon) => void }) {
  const Icon = landingIcon(value);
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-semibold text-text-secondary">
        Ícone
      </label>
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={18} />
        </span>
        <select id={id} className={`${selectClass} h-10 text-[14px]`} value={value} onChange={(e) => onChange(e.target.value as LandingIcon)}>
          {LANDING_ICONS.map((name) => (
            <option key={name} value={name}>
              {ICON_LABELS[name]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const ICON_LABELS: Record<LandingIcon, string> = {
  Sparkles: "Brilho",
  Zap: "Raio",
  ShieldCheck: "Escudo",
  Award: "Medalha",
  Star: "Estrela",
  CheckCircle2: "Confirmado",
  Users: "Pessoas",
  Phone: "Telefone",
  Globe: "Mundo",
  Heart: "Coração",
  Clock: "Relógio",
  Calendar: "Agenda",
  MapPin: "Local",
  Truck: "Entrega",
  Wrench: "Ferramenta",
  Stethoscope: "Saúde",
  GraduationCap: "Educação",
  Home: "Casa",
  Briefcase: "Negócios",
  Scissors: "Beleza",
  Camera: "Foto",
  Utensils: "Comida",
  Car: "Carro",
  Dumbbell: "Academia",
};

function SectionHeading<D extends { badge?: string; title: string; subtitle?: string }>({ data, set }: { data: D; set: (patch: Partial<D>) => void }) {
  return (
    <>
      <Field label="Selo" value={data.badge} max={MAX.badge} onChange={(badge) => set({ badge } as Partial<D>)} />
      <Field label="Título" required value={data.title} max={MAX.sectionTitle} onChange={(title) => set({ title } as Partial<D>)} />
      <Field label="Subtítulo" value={data.subtitle} max={MAX.sectionSubtitle} multiline onChange={(subtitle) => set({ subtitle } as Partial<D>)} />
    </>
  );
}

/** Campos de uma seção. `onChange` recebe a seção inteira atualizada. */
export function SectionEditor({ section, onChange }: { section: LandingSection; onChange: (section: LandingSection) => void }) {
  const set = <D,>(patch: Partial<D>) => onChange({ ...section, data: { ...section.data, ...patch } } as LandingSection);

  switch (section.type) {
    case "hero": {
      const d = section.data;
      const s = set<HeroData>;
      return (
        <>
          <Field label="Selo" value={d.badge} max={MAX.badge} onChange={(badge) => s({ badge })} />
          <Field label="Título principal" required value={d.headline} max={MAX.headline} multiline onChange={(headline) => s({ headline })} />
          <Field label="Subtítulo" value={d.subheadline} max={MAX.subheadline} multiline onChange={(subheadline) => s({ subheadline })} />
          <Field label="Texto do botão (abre o chat)" required value={d.ctaText} max={MAX.ctaText} onChange={(ctaText) => s({ ctaText, ctaAction: "chat" })} />
          <Field label="Botão secundário (leva aos serviços)" value={d.secondaryCtaText} max={MAX.ctaText} placeholder="Deixe vazio para esconder" onChange={(secondaryCtaText) => s({ secondaryCtaText, secondaryCtaLink: "#servicos" })} />
          <Field label="Imagem de destaque (https)" value={d.imageUrl} max={1000} placeholder="https://" onChange={(imageUrl) => s({ imageUrl: imageUrl.trim() })} />
          {d.imageUrl && !d.imageUrl.startsWith("https://") && <span className="text-[12px] text-danger-strong">O endereço da imagem precisa começar com https://</span>}
        </>
      );
    }
    case "services": {
      const s = set<typeof section.data>;
      return (
        <>
          <SectionHeading data={section.data} set={s} />
          <ItemList<ServiceItem>
            noun="Serviço"
            items={section.data.items}
            max={MAX.services}
            onChange={(items) => s({ items })}
            create={() => ({ id: newId("srv"), icon: "Sparkles", title: "Novo serviço", description: "Descreva o serviço." })}
            render={(item, update) => (
              <>
                <IconSelect value={item.icon} onChange={(icon) => update({ icon })} />
                <Field label="Nome" required value={item.title} max={MAX.itemTitle} onChange={(title) => update({ title })} />
                <Field label="Descrição" required value={item.description} max={MAX.itemDescription} multiline onChange={(description) => update({ description })} />
                <Field label="Selo de destaque" value={item.highlight} max={MAX.highlight} placeholder="Ex.: Mais procurado" onChange={(highlight) => update({ highlight: highlight || undefined })} />
              </>
            )}
          />
        </>
      );
    }
    case "features": {
      const s = set<typeof section.data>;
      return (
        <>
          <SectionHeading data={section.data} set={s} />
          <ItemList<FeatureItem>
            noun="Diferencial"
            items={section.data.items}
            max={MAX.features}
            onChange={(items) => s({ items })}
            create={() => ({ id: newId("feat"), title: "Novo diferencial", description: "Explique por que isso importa para o cliente." })}
            render={(item, update) => (
              <>
                <Field label="Título" required value={item.title} max={MAX.itemTitle} onChange={(title) => update({ title })} />
                <Field label="Descrição" required value={item.description} max={MAX.itemDescription} multiline onChange={(description) => update({ description })} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Número" value={item.statNumber} max={MAX.statNumber} placeholder="Ex.: 15 anos" onChange={(statNumber) => update({ statNumber: statNumber || undefined })} />
                  <Field label="Legenda" value={item.statLabel} max={MAX.statLabel} placeholder="Ex.: de mercado" onChange={(statLabel) => update({ statLabel: statLabel || undefined })} />
                </div>
              </>
            )}
          />
        </>
      );
    }
    case "testimonials": {
      const s = set<typeof section.data>;
      return (
        <>
          <p className="flex gap-2 rounded-2xl bg-warning/14 p-3 text-[13px] leading-snug text-warning-strong">
            <TriangleAlert size={16} className="mt-px shrink-0" />
            Use só depoimentos reais, com autorização do cliente. Depoimento inventado é propaganda enganosa.
          </p>
          <SectionHeading data={section.data} set={s} />
          <ItemList<TestimonialItem>
            noun="Depoimento"
            items={section.data.items}
            max={MAX.testimonials}
            onChange={(items) => s({ items })}
            create={() => ({ id: newId("test"), author: "Nome do cliente", content: "Depoimento do cliente.", rating: 5 })}
            render={(item, update) => (
              <>
                <Field label="Depoimento" required value={item.content} max={MAX.testimonial} multiline onChange={(content) => update({ content })} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Nome" required value={item.author} max={MAX.author} onChange={(author) => update({ author })} />
                  <Field label="Cidade ou profissão" value={item.role} max={MAX.author} onChange={(role) => update({ role: role || undefined })} />
                </div>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Nota">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={item.rating === n} aria-label={`${n} estrelas`} onClick={() => update({ rating: n })} className="p-0.5">
                      <Star size={18} className={n <= item.rating ? "fill-warning text-warning" : "text-text-secondary/40"} />
                    </button>
                  ))}
                </div>
              </>
            )}
          />
        </>
      );
    }
    case "faq": {
      const s = set<typeof section.data>;
      return (
        <>
          <SectionHeading data={section.data} set={s} />
          <ItemList<FaqItem>
            noun="Pergunta"
            items={section.data.items}
            max={MAX.faq}
            onChange={(items) => s({ items })}
            create={() => ({ id: newId("faq"), question: "Nova pergunta?", answer: "Escreva a resposta." })}
            render={(item, update) => (
              <>
                <Field label="Pergunta" required value={item.question} max={MAX.question} onChange={(question) => update({ question })} />
                <Field label="Resposta" required value={item.answer} max={MAX.answer} multiline onChange={(answer) => update({ answer })} />
              </>
            )}
          />
        </>
      );
    }
    case "cta": {
      const d = section.data;
      const s = set<CtaData>;
      return (
        <>
          <Field label="Título" required value={d.headline} max={MAX.ctaHeadline} multiline onChange={(headline) => s({ headline })} />
          <Field label="Subtítulo" value={d.subheadline} max={MAX.ctaSubheadline} multiline onChange={(subheadline) => s({ subheadline })} />
          <Field label="Texto do botão (abre o chat)" required value={d.ctaText} max={MAX.ctaText} onChange={(ctaText) => s({ ctaText, ctaAction: "chat" })} />
          <Field label="Observação" value={d.note} max={MAX.note} placeholder="Ex.: Resposta em poucos minutos" onChange={(note) => s({ note: note || undefined })} />
        </>
      );
    }
    case "footer": {
      const d = section.data;
      const s = set<FooterData>;
      return (
        <>
          <Field label="Nome da empresa" required value={d.companyName} max={MAX.companyName} onChange={(companyName) => s({ companyName })} />
          <Field label="Frase" value={d.tagline} max={MAX.tagline} onChange={(tagline) => s({ tagline: tagline || undefined })} />
          <Field label="Direitos autorais" value={d.copyright} max={MAX.copyright} onChange={(copyright) => s({ copyright: copyright || undefined })} />
        </>
      );
    }
  }
}
