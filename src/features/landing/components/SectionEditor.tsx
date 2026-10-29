import { ArrowDown, ArrowUp, MousePointerClick, Plus, Star, Trash2, TriangleAlert } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { inputClass, selectClass, textareaClass } from "../../../shared/components/ui/styles";
import {
  type CtaData,
  type FaqItem,
  type FeatureItem,
  type FooterData,
  type HeroData,
  LANDING_ICONS,
  LINK_KINDS,
  type LinkItem,
  type LinkKind,
  type LandingIcon,
  type LandingSection,
  MAX,
  type ProductItem,
  type ServiceItem,
  type TestimonialItem,
} from "../contract";
import { landingIcon } from "../icons";
import { normalizePixKey } from "../pix";
import { fromLocalInput, scheduleState, toLocalInput } from "../schedule";

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 6)}`;

export function Field({ label, value, max, onChange, multiline, placeholder, required, inputMode }: { label: string; value: string | undefined; max: number; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; required?: boolean; inputMode?: "text" | "tel" | "email" | "url" | "decimal" | "numeric" }) {
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
        <textarea {...props} className={`${textareaClass} min-h-20 text-[16px] min-[420px]:text-[14px] ${empty ? "border-danger" : ""}`} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...props} inputMode={inputMode} className={`${inputClass} text-[16px] min-[420px]:text-[14px] ${empty ? "border-danger" : ""}`} onChange={(e) => onChange(e.target.value)} />
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
function ItemList<T extends { id: string }>({ items, max, min = 1, noun, onChange, create, render, meta }: {
  meta?: (item: T) => ReactNode;
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
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-bold text-text-secondary">
              {noun} {i + 1}
              {meta?.(item)}
            </span>
            <div className="flex shrink-0">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-panel-hover disabled:opacity-30 min-[420px]:h-8 min-[420px]:w-8" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">
                <ArrowUp size={14} />
              </button>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-panel-hover disabled:opacity-30 min-[420px]:h-8 min-[420px]:w-8" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Descer">
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-danger/12 hover:text-danger disabled:opacity-30 min-[420px]:h-8 min-[420px]:w-8"
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
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-ui text-[13px] font-semibold text-primary-strong hover:bg-primary/8"
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
export type ClickStats = Record<string, { last7: number; last30: number }>;

export function SectionEditor({ section, onChange, clicks }: { section: LandingSection; onChange: (section: LandingSection) => void; clicks?: ClickStats }) {
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
    case "links": {
      const s = set<typeof section.data>;
      return (
        <ItemList<LinkItem>
          noun="Link"
          meta={(item) => (
            <>
              <ScheduleBadge item={item} />
              <ClickCount stats={clicks?.[item.id]} />
            </>
          )}
          items={section.data.items}
          max={MAX.links}
          onChange={(items) => s({ items })}
          create={() => ({ id: newId("lnk"), kind: "site", label: "Meu site", url: "https://" })}
          render={(item, update) => <LinkFields item={item} update={update} />}
        />
      );
    }
    case "products": {
      const s = set<typeof section.data>;
      return (
        <>
          <Field label="Título da seção" value={section.data.title} max={120} placeholder="Produtos" onChange={(title) => s({ title: title || undefined })} />
          <ItemList<ProductItem>
            noun="Produto"
            meta={(item) => (
              <>
                <ScheduleBadge item={item} />
                <ClickCount stats={clicks?.[item.id]} />
              </>
            )}
            items={section.data.items}
            max={MAX.products}
            onChange={(items) => s({ items })}
            create={() => ({ id: newId("prd"), name: "Novo produto" })}
            render={(item, update) => <ProductFields item={item} update={update} />}
          />
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

const LINK_KIND_LABELS: Record<LinkKind, string> = {
  chat: "Conversar com o bot",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  tiktok: "TikTok",
  google: "Avaliar no Google",
  site: "Site",
  link: "Outro link",
  pix: "Pix (QR Code)",
  youtube: "YouTube",
};

const LINK_HINTS: Partial<Record<LinkKind, string>> = {
  instagram: "https://instagram.com/seuperfil",
  tiktok: "https://tiktok.com/@seuperfil",
  youtube: "https://youtube.com/@seucanal",
  google: "Link de \"Pedir avaliações\" do Perfil da Empresa no Google",
  site: "https://",
  link: "https://",
};

/** Número com DDD a partir do link wa.me guardado. */
const phoneFromWa = (url?: string) => (url ?? "").replace(/^https:\/\/wa\.me\/(55)?/, "");
const waFromPhone = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d ? `https://wa.me/${d.length <= 11 ? `55${d}` : d}` : "";
};

/** Estado de um item agendado, mostrado no cabeçalho do cartão. */
export function ScheduleBadge({ item }: { item: { startsAt?: string; endsAt?: string } }) {
  const state = scheduleState(item);
  if (state === "active") return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${state === "scheduled" ? "bg-warning/14 text-warning-strong" : "bg-danger/12 text-danger-strong"}`}>
      {state === "scheduled" ? "Agendado" : "Expirado"}
    </span>
  );
}

export function ClickCount({ stats }: { stats?: { last7: number; last30: number } }) {
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold tabular-nums text-text-secondary" title="Cliques únicos por dia">
      <MousePointerClick size={12} />
      {stats?.last7 ?? 0} em 7 dias, {stats?.last30 ?? 0} em 30
    </span>
  );
}

function ScheduleFields({ item, update }: { item: { startsAt?: string; endsAt?: string }; update: (patch: { startsAt?: string; endsAt?: string }) => void }) {
  const startId = useId();
  const endId = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">Aparece na página (opcional)</span>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
        <label htmlFor={startId} className="flex flex-col gap-1 text-[12px] text-text-secondary">
          A partir de
          <input id={startId} type="datetime-local" className={`${inputClass} text-[14px]`} value={toLocalInput(item.startsAt)} onChange={(e) => update({ startsAt: fromLocalInput(e.target.value) })} />
        </label>
        <label htmlFor={endId} className="flex flex-col gap-1 text-[12px] text-text-secondary">
          Até
          <input id={endId} type="datetime-local" className={`${inputClass} text-[14px]`} value={toLocalInput(item.endsAt)} onChange={(e) => update({ endsAt: fromLocalInput(e.target.value) })} />
        </label>
      </div>
      {item.startsAt && item.endsAt && Date.parse(item.endsAt) <= Date.parse(item.startsAt) && <span className="text-[12px] text-danger-strong">O fim precisa ser depois do início.</span>}
    </div>
  );
}

/** Valor do Pix: guarda o texto digitado (com vírgula) e entrega o número. */
function AmountField({ value, onChange }: { value?: number; onChange: (v?: number) => void }) {
  const [text, setText] = useState(value ? String(value).replace(".", ",") : "");
  return (
    <Field
      label="Valor (opcional)"
      value={text}
      max={12}
      inputMode="decimal"
      placeholder="Deixe vazio para a pessoa digitar"
      onChange={(v) => {
        const clean = v.replace(/[^\d,.]/g, "");
        setText(clean);
        const n = Number(clean.replace(",", "."));
        onChange(clean && Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined);
      }}
    />
  );
}

/** Um botão do link na bio. WhatsApp pede só o número e vira o link oficial wa.me. */
export function LinkFields({ item, update }: { item: LinkItem; update: (patch: Partial<LinkItem>) => void }) {
  const id = useId();
  const phone = item.kind === "whatsapp" ? phoneFromWa(item.url) : "";
  const keyOk = !item.pixKey || normalizePixKey(item.pixKey) !== "";
  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-[13px] font-semibold text-text-secondary">
          Tipo
        </label>
        <select
          id={id}
          className={`${selectClass} text-[14px]`}
          value={item.kind}
          onChange={(e) => {
            const kind = e.target.value as LinkKind;
            update({ kind, label: LINK_KIND_LABELS[kind], url: kind === "chat" || kind === "pix" ? undefined : kind === "whatsapp" ? "" : "https://" });
          }}
        >
          {LINK_KINDS.map((k) => (
            <option key={k} value={k}>
              {LINK_KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </div>
      <Field label="Texto do botão" required value={item.label} max={MAX.linkLabel} onChange={(label) => update({ label })} />
      {item.kind === "whatsapp" && (
        <>
          <Field label="WhatsApp com DDD" value={phone} max={20} inputMode="tel" placeholder="11 91234-5678" onChange={(v) => update({ url: waFromPhone(v) })} />
          <Field
            label="Mensagem pronta (opcional)"
            value={item.message}
            max={MAX.message}
            multiline
            placeholder="Ex.: Vim pela bio e quero saber do curso"
            onChange={(message) => update({ message: message || undefined })}
          />
        </>
      )}
      {item.kind === "pix" && (
        <>
          <Field label="Chave Pix" required value={item.pixKey} max={MAX.pixKey} inputMode="text" placeholder="CPF, CNPJ, e-mail, +55... ou chave aleatória" onChange={(pixKey) => update({ pixKey: pixKey.trim() })} />
          {!keyOk && <span className="text-[12px] text-danger-strong">Chave inválida. Use CPF, CNPJ, e-mail, telefone com +55 ou chave aleatória.</span>}
          <Field label="Nome de quem recebe" required value={item.pixName} max={MAX.pixName} onChange={(pixName) => update({ pixName })} />
          <Field label="Cidade" required value={item.pixCity} max={MAX.pixCity} onChange={(pixCity) => update({ pixCity })} />
          <AmountField value={item.pixAmount} onChange={(pixAmount) => update({ pixAmount })} />
          <p className="flex gap-2 rounded-2xl bg-warning/14 p-3 text-[12px] leading-snug text-warning-strong">
            <TriangleAlert size={14} className="mt-px shrink-0" />O dinheiro vai direto para a sua chave, sem taxa. O Nexo não confirma o pagamento: confira no seu banco.
          </p>
        </>
      )}
      {item.kind !== "chat" && item.kind !== "whatsapp" && item.kind !== "pix" && (
        <Field label="Endereço (https)" value={item.url} max={1000} inputMode="url" placeholder={LINK_HINTS[item.kind]} onChange={(url) => update({ url: url.trim() })} />
      )}
      {item.kind === "chat" && <p className="text-[12px] text-text-secondary">Abre o bot vinculado à página (aba Página).</p>}
      <ScheduleFields item={item} update={update} />
    </>
  );
}

/** Um produto: só links de compra, nenhuma integração com loja. */
export function ProductFields({ item, update }: { item: ProductItem; update: (patch: Partial<ProductItem>) => void }) {
  const phone = phoneFromWa(item.whatsappUrl);
  const bad = (url: string | undefined, hosts: string[]) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return !(u.protocol === "https:" && hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`)));
    } catch {
      return true;
    }
  };
  return (
    <>
      <Field label="Nome do produto" required value={item.name} max={MAX.productName} onChange={(name) => update({ name })} />
      <Field label="Preço (texto)" value={item.price} max={MAX.productPrice} inputMode="text" placeholder="R$ 129,90" onChange={(price) => update({ price: price || undefined })} />
      <Field label="Imagem (https)" value={item.imageUrl} max={1000} inputMode="url" placeholder="https://" onChange={(imageUrl) => update({ imageUrl: imageUrl.trim() || undefined })} />
      <Field label="Link do Mercado Livre" value={item.mercadoLivreUrl} max={1000} inputMode="url" placeholder="https://www.mercadolivre.com.br/..." onChange={(v) => update({ mercadoLivreUrl: v.trim() || undefined })} />
      {bad(item.mercadoLivreUrl, ["mercadolivre.com.br", "mercadolivre.com"]) && <span className="text-[12px] text-danger-strong">Use um link https de mercadolivre.com.br ou mercadolivre.com.</span>}
      <Field label="Link da Shopee" value={item.shopeeUrl} max={1000} inputMode="url" placeholder="https://shopee.com.br/..." onChange={(v) => update({ shopeeUrl: v.trim() || undefined })} />
      {bad(item.shopeeUrl, ["shopee.com.br"]) && <span className="text-[12px] text-danger-strong">Use um link https de shopee.com.br.</span>}
      <Field label="WhatsApp para comprar (com DDD)" value={phone} max={20} inputMode="tel" placeholder="11 91234-5678" onChange={(v) => update({ whatsappUrl: waFromPhone(v) || undefined })} />
      {item.whatsappUrl && (
        <Field
          label="Mensagem pronta (opcional)"
          value={item.whatsappMessage}
          max={MAX.message}
          multiline
          placeholder={`Deixe vazio para "Olá! Tenho interesse em ${item.name}."`}
          onChange={(whatsappMessage) => update({ whatsappMessage: whatsappMessage || undefined })}
        />
      )}
      <ScheduleFields item={item} update={update} />
    </>
  );
}
