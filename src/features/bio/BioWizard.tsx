import { ArrowLeft, AtSign, Bot, Briefcase, Check, ChevronRight, Info, Link2, ListChecks, Plus, Rocket, ShoppingBag, Sparkles, Trash2, UserRound, WhatsApp, X, Zap } from "../../shared/icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { apiErrorMessage } from "../../api/instance";
import { useCreateBio } from "../../api/mutations/useBioMutations";
import { Button } from "../../shared/components/ui/Button";
import { PhoneFrame } from "../../shared/components/ui/PhoneFrame";
import { inputClass, textareaClass } from "../../shared/components/ui/styles";
import { toast } from "../../shared/components/ui/toast-store";
import { LandingRenderer } from "../landing/components/LandingRenderer";
import { ThemePicker } from "../landing/components/ThemePicker";
import { type LandingPageRecord, type LandingSection, type LandingTheme, type LinkItem, type ProductItem, themeBg, themeIsDark } from "../landing/contract";
import { normalizePixKey } from "../landing/pix";
import { parseLinks, recognizeLink } from "./parseLinks";
import { AUDIENCE_PRESETS, BIO_AUDIENCES, type BioAudience } from "./presets";
import { useGetMe } from "../../api/queries/useGetMe";

const AUDIENCE_ICONS: Record<BioAudience, typeof UserRound> = { creator: Sparkles, seller: ShoppingBag, business: Briefcase };

interface FaqRow {
  key: string;
  question: string;
  answer: string;
  hint?: string;
}

interface WizardState {
  audience: BioAudience | null;
  name: string;
  handle: string;
  tagline: string;
  photoUrl: string;
  linksText: string;
  links: LinkItem[];
  unknown: string[];
  pixOn: boolean;
  pixKey: string;
  pixName: string;
  pixCity: string;
  products: (ProductItem & { link: string })[];
  faqs: FaqRow[];
  faqsTouched: boolean;
  theme: LandingTheme;
}

const INITIAL: WizardState = {
  audience: null,
  name: "",
  handle: "",
  tagline: "",
  photoUrl: "",
  linksText: "",
  links: [],
  unknown: [],
  pixOn: false,
  pixKey: "",
  pixName: "",
  pixCity: "",
  products: [],
  faqs: [],
  faqsTouched: false,
  theme: "midnight-dark",
};

const STEP_TITLES = ["Você é", "Seu perfil", "Seus links", "Perguntas", "Visual"] as const;

/**
 * Bio em 1 minuto: quem já contou quem é no "conhecer você" responde só o essencial. A pergunta de contato
 * já vem respondida (é verdade: a bio tem o botão do WhatsApp), então o bot nasce funcionando.
 */
const CONTACT_FAQ: Record<BioAudience, { question: string; answer: string }> = {
  business: { question: "Como falo com vocês?", answer: "Pelo WhatsApp: toque no botão aqui embaixo e mande a sua mensagem." },
  seller: { question: "Como faço um pedido?", answer: "Pelo WhatsApp: toque no botão aqui embaixo e me diga qual produto você quer." },
  creator: { question: "Como falo com você?", answer: "Pelo WhatsApp: toque no botão aqui embaixo e mande a sua mensagem." },
};
/** As duas perguntas mais comuns de cada público (índices em AUDIENCE_PRESETS[...].suggestions). */
const EXPRESS_PICKS: Record<BioAudience, number[]> = { business: [0, 3], seller: [0, 1], creator: [0, 2] };

interface ExpressState {
  whatsapp: string;
  instagram: string;
  answers: string[];
}

/** Monta o estado completo do assistente a partir da tela rápida. */
function fromExpress(s: WizardState, e: ExpressState): WizardState {
  const audience = s.audience ?? "business";
  const wa = recognizeLink(e.whatsapp);
  const handle = e.instagram.trim().replace(/^@?/, "@");
  const ig = e.instagram.trim() ? recognizeLink(/\//.test(e.instagram.trim()) ? e.instagram.trim() : handle) : null;
  const picks = EXPRESS_PICKS[audience].map((i) => AUDIENCE_PRESETS[audience].suggestions[i]);
  const contact = CONTACT_FAQ[audience];
  return {
    ...s,
    handle: s.handle || (ig?.kind === "instagram" ? handle : ""),
    links: [wa, ig].filter((l): l is LinkItem => l !== null),
    faqs: [
      { key: "contact", question: contact.question, answer: contact.answer },
      ...picks.map((p, i) => ({ key: `q${i}`, question: p.question, answer: e.answers[i]?.trim() ?? "" })),
    ],
  };
}
const newKey = () => crypto.randomUUID().slice(0, 6);
const isHttps = (v: string) => /^https:\/\/\S+$/.test(v.trim());

/** Cada link de produto vira o botão da loja certa pelo domínio. */
function productFromRow(row: ProductItem & { link: string }, whatsappUrl?: string): ProductItem {
  const { link, ...rest } = row;
  const url = link.trim();
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    /* link inválido: segue sem botão de loja */
  }
  return {
    ...rest,
    name: rest.name.trim(),
    price: rest.price?.trim() || undefined,
    ...(host.endsWith("mercadolivre.com.br") || host.endsWith("mercadolivre.com") ? { mercadoLivreUrl: url } : {}),
    ...(host.endsWith("shopee.com.br") ? { shopeeUrl: url } : {}),
    ...(whatsappUrl ? { whatsappUrl } : {}),
  };
}

const productLinkOk = (link: string) => {
  if (!link.trim()) return true;
  try {
    const host = new URL(link.trim()).hostname;
    return link.trim().startsWith("https://") && /(^|\.)(mercadolivre\.com\.br|mercadolivre\.com|shopee\.com\.br)$/.test(host);
  } catch {
    return false;
  }
};

function buildPayload(s: WizardState) {
  const preset = AUDIENCE_PRESETS[s.audience ?? "business"];
  const links: LinkItem[] = [...s.links];
  if (s.pixOn && s.pixKey.trim()) {
    links.push({ id: `lnk-${newKey()}`, kind: "pix", label: preset.pixLabel, pixKey: s.pixKey.trim(), pixName: s.pixName.trim(), pixCity: s.pixCity.trim() });
  }
  const whatsappUrl = s.links.find((l) => l.kind === "whatsapp")?.url;
  const products = s.products.filter((p) => p.name.trim()).map((p) => productFromRow(p, whatsappUrl));
  return {
    audience: s.audience ?? "business",
    name: s.name.trim(),
    handle: s.handle.trim() ? `@${s.handle.trim().replace(/^@/, "")}` : undefined,
    tagline: s.tagline.trim() || undefined,
    photoUrl: s.photoUrl.trim() || undefined,
    theme: s.theme,
    links,
    products,
    faqs: s.faqs.filter((f) => f.question.trim() && f.answer.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
  };
}

function previewSections(s: WizardState): LandingSection[] {
  const p = buildPayload(s);
  const items: LinkItem[] = [{ id: "lnk-chat", kind: "chat", label: "Converse com o assistente" }, ...p.links];
  const out: LandingSection[] = [
    { id: "h", type: "hero", enabled: true, data: { headline: p.name || "Seu nome", badge: p.handle, subheadline: p.tagline, ctaText: "Conversar agora", ctaAction: "chat", imageUrl: p.photoUrl } },
    { id: "l", type: "links", enabled: true, data: { items } },
  ];
  if (p.products.length) out.push({ id: "p", type: "products", enabled: true, data: { title: "Produtos", items: p.products } });
  return out;
}

function Label({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-text-secondary">
      {children}
    </label>
  );
}

interface BioWizardProps {
  /** Chamado antes de criar: o pai deixa de trocar para o editor enquanto a tela final não aparece. */
  onLock: () => void;
  onCreated: (page: LandingPageRecord) => void;
}

/** Criação guiada da bio: um passo por tela, barra de progresso e ação principal ao alcance do polegar. */
export function BioWizard({ onLock, onCreated }: BioWizardProps) {
  const reduce = useReducedMotion();
  const { mutateAsync: createBio, isPending } = useCreateBio();
  const [step, setStep] = useState(0);
  const [s, setS] = useState<WizardState>(INITIAL);
  const set = (patch: Partial<WizardState>) => setS((cur) => ({ ...cur, ...patch }));
  const preset = AUDIENCE_PRESETS[s.audience ?? "business"];
  const { data: me } = useGetMe();
  const prefilled = useRef(false);
  /** null enquanto não sabemos se a pessoa já fez o "conhecer você"; aí decide entre a tela rápida e o passo a passo. */
  const [express, setExpress] = useState<boolean | null>(null);
  const [ex, setEx] = useState<ExpressState>({ whatsapp: "", instagram: "", answers: ["", ""] });

  // Já vem preenchida com o que a pessoa contou no "conhecer você" (público, marca ou @, cidade).
  useEffect(() => {
    if (!me || prefilled.current) return;
    prefilled.current = true;
    const p = me.workspace.profile;
    const brand = p.brandName?.trim() ?? "";
    const isHandle = brand.startsWith("@");
    setExpress(Boolean(p.audience));
    if (isHandle) setEx((cur) => ({ ...cur, instagram: cur.instagram || brand }));
    setS((cur) => {
      const audience = cur.audience ?? p.audience ?? null;
      const ap = audience ? AUDIENCE_PRESETS[audience] : null;
      return {
        ...cur,
        audience,
        ...(ap && !cur.audience ? { theme: ap.defaultTheme, faqs: cur.faqsTouched ? cur.faqs : ap.suggestions.slice(0, 3).map((x) => ({ key: newKey(), question: x.question, answer: "", hint: x.hint })) } : {}),
        name: cur.name || (isHandle ? me.user.name ?? "" : brand || me.user.name || ""),
        handle: cur.handle || (isHandle ? brand : ""),
        pixCity: cur.pixCity || (p.city ?? "").slice(0, 15),
      };
    });
  }, [me]);

  const pickAudience = (audience: BioAudience) => {
    const p = AUDIENCE_PRESETS[audience];
    set({
      audience,
      theme: p.defaultTheme,
      ...(s.faqsTouched ? {} : { faqs: p.suggestions.slice(0, 3).map((x) => ({ key: newKey(), question: x.question, answer: "", hint: x.hint })) }),
    });
    setStep(1);
  };

  const addLinks = () => {
    if (!s.linksText.trim()) return;
    const { found, unknown } = parseLinks(s.linksText);
    const existing = new Set(s.links.map((l) => l.url));
    const fresh = found.filter((l) => !existing.has(l.url)).slice(0, 11 - s.links.length);
    set({ links: [...s.links, ...fresh], unknown, linksText: unknown.length ? unknown.join("\n") : "" });
  };

  const pixKeyOk = !s.pixOn || !s.pixKey.trim() || normalizePixKey(s.pixKey) !== "";
  const pixComplete = !s.pixOn || !s.pixKey.trim() || (normalizePixKey(s.pixKey) !== "" && !!s.pixName.trim() && !!s.pixCity.trim());
  const productsOk = s.products.every((p) => productLinkOk(p.link));
  const filledFaqs = s.faqs.filter((f) => f.question.trim() && f.answer.trim()).length;

  const canContinue = [
    !!s.audience,
    s.name.trim().length >= 2 && (!s.photoUrl.trim() || isHttps(s.photoUrl)),
    pixComplete && productsOk,
    filledFaqs >= 3,
    true,
  ][step];

  const publish = async (state: WizardState = s) => {
    onLock();
    try {
      const { page } = await createBio(buildPayload(state));
      onCreated(page);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a sua bio."));
    }
  };

  const next = () => {
    if (step === 2 && s.linksText.trim()) addLinks();
    if (step === STEP_TITLES.length - 1) void publish();
    else setStep(step + 1);
  };

  const body = [
    // 0: público
    <div key="aud" className="flex flex-col gap-3">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-text-primary">Você é...</h1>
      <p className="text-[15px] text-text-secondary">Escolha o ponto de partida. Você pode mudar tudo depois.</p>
      <div className="mt-2 flex flex-col gap-3">
        {BIO_AUDIENCES.map((a) => {
          const Icon = AUDIENCE_ICONS[a];
          const p = AUDIENCE_PRESETS[a];
          const active = s.audience === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => pickAudience(a)}
              aria-pressed={active}
              className={`flex min-h-[76px] items-center gap-4 rounded-3xl border p-4 text-left transition-colors ${active ? "border-primary bg-primary/8 ring-4 ring-primary/12" : "border-border-ui bg-panel hover:bg-panel-hover"}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon size={24} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[17px] font-bold text-text-primary">{p.title}</span>
                <span className="text-[14px] leading-snug text-text-secondary">{p.description}</span>
              </span>
              <ChevronRight size={20} className="shrink-0 text-text-secondary" />
            </button>
          );
        })}
      </div>
    </div>,

    // 1: perfil
    <div key="profile" className="flex flex-col gap-4">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-text-primary">Como você quer aparecer?</h1>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio-name">Nome</Label>
        <input id="bio-name" className={inputClass} value={s.name} maxLength={100} autoComplete="name" placeholder={preset.namePlaceholder} onChange={(e) => set({ name: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio-handle">Seu @ (opcional)</Label>
        <input id="bio-handle" className={inputClass} value={s.handle} maxLength={40} autoCapitalize="none" autoCorrect="off" placeholder="@seuperfil" onChange={(e) => set({ handle: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio-tagline">Frase curta (opcional)</Label>
        <textarea id="bio-tagline" className={`${textareaClass} min-h-20`} value={s.tagline} maxLength={400} placeholder={preset.taglinePlaceholder} onChange={(e) => set({ tagline: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio-photo">Foto, por link (opcional)</Label>
        <input id="bio-photo" className={inputClass} value={s.photoUrl} inputMode="url" autoCapitalize="none" autoCorrect="off" placeholder="https://" onChange={(e) => set({ photoUrl: e.target.value.trim() })} />
        {s.photoUrl && !isHttps(s.photoUrl) && <span className="text-[12px] text-danger-strong">O endereço da foto precisa começar com https://</span>}
        <span className="text-[12px] text-text-secondary">Cole o endereço https de uma imagem.</span>
      </div>
    </div>,

    // 2: links
    <div key="links" className="flex flex-col gap-4">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-text-primary">Cole seus links</h1>
      <p className="text-[15px] text-text-secondary">Cole um ou vários. O Nexo reconhece Instagram, TikTok, YouTube, WhatsApp, Mercado Livre, Shopee e sites.</p>
      <div className="flex flex-col gap-2">
        <label htmlFor="bio-links" className="sr-only">
          Links para adicionar
        </label>
        <textarea
          id="bio-links"
          className={`${textareaClass} min-h-28 font-mono text-[14px]`}
          value={s.linksText}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder={preset.linksPlaceholder}
          onChange={(e) => set({ linksText: e.target.value })}
          onBlur={addLinks}
        />
        <Button variant="secondary" size="lg" icon={Plus} onClick={addLinks} disabled={!s.linksText.trim() || s.links.length >= 11}>
          Adicionar
        </Button>
        {s.unknown.length > 0 && (
          <p className="flex gap-2 rounded-2xl bg-warning/14 p-3 text-[13px] leading-snug text-warning-strong">
            <Info size={16} className="mt-px shrink-0" />
            Não reconheci: {s.unknown.join(", ")}. Confira o endereço ou o número com DDD.
          </p>
        )}
      </div>

      {s.links.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Links adicionados">
          {s.links.map((l) => (
            <li key={l.id} className="flex items-center gap-1 rounded-2xl border border-border-ui bg-panel p-2 pl-3">
              <Link2 size={16} className="shrink-0 text-text-secondary" />
              <div className="flex min-w-0 flex-1 flex-col">
                <input
                  aria-label={`Texto do botão ${l.label}`}
                  className="h-11 w-full min-w-0 rounded-lg bg-transparent px-1 text-[16px] font-semibold text-text-primary outline-none focus:bg-panel-2"
                  value={l.label}
                  maxLength={40}
                  onChange={(e) => set({ links: s.links.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)) })}
                />
                <span className="truncate px-1 text-[12px] text-text-secondary">{l.url?.replace("https://", "")}</span>
              </div>
              <button type="button" aria-label={`Remover ${l.label}`} onClick={() => set({ links: s.links.filter((x) => x.id !== l.id) })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-danger/12 hover:text-danger">
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-3xl border border-border-ui bg-panel p-4">
        <button type="button" onClick={() => set({ pixOn: !s.pixOn })} aria-expanded={s.pixOn} className="flex min-h-11 w-full items-center justify-between gap-3 text-left">
          <span className="flex flex-col">
            <span className="text-[15px] font-bold text-text-primary">Receber por Pix (opcional)</span>
            <span className="text-[13px] text-text-secondary">QR Code e copia e cola, sem taxa</span>
          </span>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${s.pixOn ? "bg-primary text-white" : "bg-panel-2 text-text-secondary"}`}>{s.pixOn ? <Check size={16} /> : <Plus size={16} />}</span>
        </button>
        {s.pixOn && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pix-key">Chave Pix</Label>
              <input id="pix-key" className={inputClass} value={s.pixKey} maxLength={77} autoCapitalize="none" autoCorrect="off" placeholder="CPF, CNPJ, e-mail, +55... ou chave aleatória" onChange={(e) => set({ pixKey: e.target.value })} />
              {!pixKeyOk && <span className="text-[12px] text-danger-strong">Chave inválida. Use CPF, CNPJ, e-mail, telefone com +55 ou chave aleatória.</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pix-name">Nome de quem recebe</Label>
              <input id="pix-name" className={inputClass} value={s.pixName} maxLength={25} onChange={(e) => set({ pixName: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pix-city">Cidade</Label>
              <input id="pix-city" className={inputClass} value={s.pixCity} maxLength={15} onChange={(e) => set({ pixCity: e.target.value })} />
            </div>
            <p className="text-[12px] leading-snug text-text-secondary">O dinheiro vai direto para a sua chave. O Nexo não confirma o pagamento.</p>
          </div>
        )}
      </div>

      {preset.offersProducts && (
        <div className="flex flex-col gap-3 rounded-3xl border border-border-ui bg-panel p-4">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-text-primary">Seus produtos (opcional)</span>
            <span className="text-[13px] text-text-secondary">Só links: cada produto leva para o Mercado Livre ou a Shopee, e o WhatsApp se você colocou um.</span>
          </div>
          {s.products.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-2xl bg-panel-2 p-3">
              <div className="flex items-center gap-1">
                <input aria-label="Nome do produto" className={inputClass} value={p.name} maxLength={80} placeholder="Nome do produto" onChange={(e) => set({ products: s.products.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) })} />
                <button type="button" aria-label="Remover produto" onClick={() => set({ products: s.products.filter((x) => x.id !== p.id) })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-danger/12 hover:text-danger">
                  <Trash2 size={18} />
                </button>
              </div>
              <input aria-label="Preço" className={inputClass} value={p.price ?? ""} maxLength={30} placeholder="R$ 129,90" onChange={(e) => set({ products: s.products.map((x) => (x.id === p.id ? { ...x, price: e.target.value } : x)) })} />
              <input
                aria-label="Link do anúncio"
                className={inputClass}
                value={p.link}
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Link do Mercado Livre ou da Shopee"
                onChange={(e) => set({ products: s.products.map((x) => (x.id === p.id ? { ...x, link: e.target.value } : x)) })}
              />
              {!productLinkOk(p.link) && <span className="text-[12px] text-danger-strong">Use um link https de mercadolivre.com.br ou shopee.com.br.</span>}
            </div>
          ))}
          {s.products.length < 12 && (
            <Button variant="secondary" size="lg" icon={Plus} onClick={() => set({ products: [...s.products, { id: `prd-${newKey()}`, name: "", link: "" }] })}>
              Adicionar produto
            </Button>
          )}
        </div>
      )}
    </div>,

    // 3: perguntas
    <div key="faq" className="flex flex-col gap-4">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-text-primary">O que seus seguidores mais perguntam?</h1>
      <p className="flex gap-2 text-[15px] text-text-secondary">
        <Bot size={18} className="mt-0.5 shrink-0 text-primary" />
        Escreva de 3 a 5 perguntas com a resposta. O Nexo monta o bot que responde por você, a qualquer hora.
      </p>
      {s.faqs.map((f, i) => (
        <div key={f.key} className="flex flex-col gap-2 rounded-3xl border border-border-ui bg-panel p-3">
          <div className="flex items-center gap-1">
            <input aria-label={`Pergunta ${i + 1}`} className={inputClass} value={f.question} maxLength={120} placeholder="Pergunta" onChange={(e) => set({ faqsTouched: true, faqs: s.faqs.map((x) => (x.key === f.key ? { ...x, question: e.target.value } : x)) })} />
            <button type="button" aria-label={`Remover pergunta ${i + 1}`} onClick={() => set({ faqsTouched: true, faqs: s.faqs.filter((x) => x.key !== f.key) })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-danger/12 hover:text-danger">
              <X size={18} />
            </button>
          </div>
          <textarea
            aria-label={`Resposta ${i + 1}`}
            className={`${textareaClass} min-h-20`}
            value={f.answer}
            maxLength={600}
            placeholder={f.hint ? `Ex.: ${f.hint}` : "Escreva a resposta"}
            onChange={(e) => set({ faqsTouched: true, faqs: s.faqs.map((x) => (x.key === f.key ? { ...x, answer: e.target.value } : x)) })}
          />
        </div>
      ))}
      {s.faqs.length < 5 && (
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-secondary">Toque para adicionar uma sugestão</span>
          <div className="flex flex-wrap gap-2">
            {preset.suggestions
              .filter((x) => !s.faqs.some((f) => f.question === x.question))
              .map((x) => (
                <button
                  key={x.question}
                  type="button"
                  onClick={() => set({ faqsTouched: true, faqs: [...s.faqs, { key: newKey(), question: x.question, answer: "", hint: x.hint }] })}
                  className="flex min-h-11 items-center gap-1.5 rounded-full border border-border-ui bg-panel-2 px-3.5 text-left text-[14px] font-medium text-text-primary hover:bg-panel-hover"
                >
                  <Plus size={14} className="shrink-0 text-primary" />
                  {x.question}
                </button>
              ))}
            <button type="button" onClick={() => set({ faqsTouched: true, faqs: [...s.faqs, { key: newKey(), question: "", answer: "" }] })} className="flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-border-ui px-3.5 text-[14px] font-semibold text-primary-strong">
              <Plus size={14} /> Outra pergunta
            </button>
          </div>
        </div>
      )}
      <p className="text-[13px] text-text-secondary">
        {filledFaqs < 3 ? `Faltam ${3 - filledFaqs} com pergunta e resposta preenchidas.` : `${filledFaqs} perguntas prontas.`}
      </p>
    </div>,

    // 4: tema e publicar
    <div key="theme" className="flex flex-col gap-4">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-text-primary">Escolha o visual</h1>
      <ThemePicker value={s.theme} onChange={(theme) => set({ theme })} />
      <PhoneFrame size="sm" inert statusTone={themeIsDark(s.theme) ? "light" : "dark"} statusBg={themeBg(s.theme)} label="Prévia da bio">
        <LandingRenderer title={s.name || "Sua bio"} theme={s.theme} sections={previewSections(s)} settings={{ showChatWidget: true, fontHeading: "inter", layout: "bio", showBadge: true }} onChat={() => undefined} />
      </PhoneFrame>
      <p className="text-[13px] leading-snug text-text-secondary">Ao publicar, a sua bio e o bot vão ao ar na hora. Dá para mudar tudo depois.</p>
    </div>,
  ];

  const last = step === STEP_TITLES.length - 1;

  if (express && s.audience) {
    const audience = s.audience;
    const merged = fromExpress(s, ex);
    const waOk = recognizeLink(ex.whatsapp)?.kind === "whatsapp";
    const igOk = !ex.instagram.trim() || merged.links.some((l) => l.kind !== "whatsapp");
    const ready = s.name.trim().length >= 2 && waOk && igOk;
    const picks = EXPRESS_PICKS[audience].map((i) => AUDIENCE_PRESETS[audience].suggestions[i]);
    const goSteps = () => {
      setS({ ...merged, faqs: merged.faqs.map((f) => ({ ...f, hint: picks.find((p) => p.question === f.question)?.hint })), faqsTouched: true });
      setExpress(false);
      setStep(1);
    };
    return (
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-[12.5px] font-bold text-primary-strong">
              <Zap size={14} data-gesture="pop" /> Bio em 1 minuto
            </span>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-text-primary">Falta pouco para a sua bio ir ao ar</h1>
            <p className="-mt-2 text-[15px] text-text-secondary">Já usamos o que você contou. Confira e publique: dá para mudar tudo depois.</p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-name">Nome na bio</Label>
              <input id="ex-name" className={inputClass} value={s.name} maxLength={100} autoComplete="organization" placeholder={preset.namePlaceholder} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-wa">Seu WhatsApp, com DDD</Label>
              <div className="relative">
                <WhatsApp size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#25D366]" />
                <input id="ex-wa" className={`${inputClass} pl-10`} value={ex.whatsapp} inputMode="tel" autoComplete="tel-national" placeholder="11 91234-5678" onChange={(e) => setEx({ ...ex, whatsapp: e.target.value })} />
              </div>
              <span className={`text-[12px] ${ex.whatsapp.trim() && !waOk ? "text-danger-strong" : "text-text-secondary"}`}>
                {ex.whatsapp.trim() && !waOk ? "Confira o número: DDD e o número, como 11 91234-5678." : "É para onde o bot e o botão da bio mandam os clientes."}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-ig">Instagram (opcional)</Label>
              <div className="relative">
                <AtSign size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input id="ex-ig" className={`${inputClass} pl-10`} value={ex.instagram.replace(/^@/, "")} autoCapitalize="none" autoCorrect="off" placeholder="seuperfil" onChange={(e) => setEx({ ...ex, instagram: e.target.value.trim() })} />
              </div>
              {!igOk && <span className="text-[12px] text-danger-strong">Use só o @ do perfil, sem espaços.</span>}
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-border-ui bg-panel p-3.5">
              <p className="flex gap-2 text-[14px] text-text-secondary">
                <Bot size={18} className="mt-0.5 shrink-0 text-primary" />
                O bot da bio já responde &ldquo;{CONTACT_FAQ[audience].question}&rdquo;. Quer que ele responda mais? (opcional)
              </p>
              {picks.map((p, i) => (
                <div key={p.question} className="flex flex-col gap-1.5">
                  <label htmlFor={`ex-q${i}`} className="text-[14px] font-semibold text-text-primary">
                    {p.question}
                  </label>
                  <input
                    id={`ex-q${i}`}
                    className={inputClass}
                    value={ex.answers[i]}
                    maxLength={600}
                    placeholder={`Ex.: ${p.hint}`}
                    onChange={(e) => setEx({ ...ex, answers: ex.answers.map((a, j) => (j === i ? e.target.value : a)) })}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[13px] font-semibold text-text-secondary">Assim vai ficar</span>
              <PhoneFrame size="sm" inert statusTone={themeIsDark(s.theme) ? "light" : "dark"} statusBg={themeBg(s.theme)} label="Prévia da bio">
                <LandingRenderer title={s.name || "Sua bio"} theme={s.theme} sections={previewSections(merged)} settings={{ showChatWidget: true, fontHeading: "inter", layout: "bio", showBadge: true }} onChat={() => undefined} />
              </PhoneFrame>
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-border-ui bg-panel px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-1.5">
            <Button size="lg" icon={Rocket} onClick={() => void publish(merged)} disabled={!ready} loading={isPending} className="w-full">
              Publicar minha bio
            </Button>
            <button type="button" onClick={goSteps} className="flex h-10 items-center justify-center gap-1.5 text-[14px] font-semibold text-primary-strong">
              <ListChecks size={16} /> Prefiro montar passo a passo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border-ui bg-panel/80 px-4 pb-3 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-xl items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            aria-label="Voltar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-primary hover:bg-panel-hover disabled:opacity-30"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12px] font-semibold text-text-secondary">
              <span>{STEP_TITLES[step]}</span>
              <span>
                Passo {step + 1} de {STEP_TITLES.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-valuemin={1} aria-valuemax={STEP_TITLES.length} aria-valuenow={step + 1} aria-label="Progresso da criação">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 34 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -16 }} transition={{ duration: 0.16 }} className="mx-auto w-full max-w-xl px-4 py-6">
            {body[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 0 && (
        <div className="shrink-0 border-t border-border-ui bg-panel px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto w-full max-w-xl">
            <Button size="lg" icon={last ? Rocket : undefined} onClick={next} disabled={!canContinue} loading={isPending} className="w-full">
              {last ? "Publicar minha bio" : "Continuar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

