import { CheckCircle2, ChevronDown, Globe, Instagram, Link2, type LucideIcon, MessageCircle, Music2, Phone, QrCode, Search, ShoppingBag, Sparkles, Star, X, Youtube } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState } from "react";
import { LogoMark } from "../../../shared/components/ui/Logo";
import type { HeroData, LandingPageSettings, LandingSection, LandingTheme, LinkItem, LinkKind, ProductItem } from "../contract";
import { landingIcon } from "../icons";
import { fold } from "../schedule";
import { PixDialog } from "./PixDialog";

// As páginas dos clientes têm paletas próprias (não seguem o tema do painel).
const THEMES: Record<
  LandingTheme,
  { page: string; header: string; muted: string; accent: string; card: string; badge: string; primary: string; secondary: string; line: string; star: string }
> = {
  "espresso-champagne": {
    page: "bg-[#140F0D] text-[#F5EBE1]",
    header: "bg-[#140F0D]/85 border-[#2E221D]",
    muted: "text-[#C5B5A5]",
    accent: "text-[#E6C687]",
    card: "bg-[#1E1714] border-[#332621]",
    badge: "bg-[#2A201B] text-[#E6C687] border-[#44332B]",
    primary: "bg-[#E6C687] text-[#140F0D] hover:bg-[#D4B475] shadow-lg shadow-[#E6C687]/15",
    secondary: "bg-[#241B17] text-[#F5EBE1] border-[#3E2F28] hover:bg-[#2F231E]",
    line: "border-[#2E221D] divide-[#2E221D]",
    star: "text-[#E6C687]",
  },
  "midnight-dark": {
    page: "bg-[#090D16] text-slate-100",
    header: "bg-[#090D16]/85 border-slate-800",
    muted: "text-slate-400",
    accent: "text-[#A78BFA]",
    card: "bg-[#0F172A] border-slate-800",
    badge: "bg-[#7C5CFF]/15 text-[#C4B5FD] border-[#7C5CFF]/30",
    primary: "bg-gradient-to-r from-[#0A6CFF] to-[#7C5CFF] text-white hover:brightness-110 shadow-lg shadow-[#7C5CFF]/25",
    secondary: "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800",
    line: "border-slate-800 divide-slate-800",
    star: "text-[#A78BFA]",
  },
  "clean-slate": {
    page: "bg-[#F8FAFC] text-slate-900",
    header: "bg-[#F8FAFC]/85 border-slate-200",
    muted: "text-slate-600",
    accent: "text-slate-900",
    card: "bg-white border-slate-200 shadow-sm",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
    secondary: "bg-white text-slate-800 border-slate-300 hover:bg-slate-50",
    line: "border-slate-200 divide-slate-200",
    star: "text-amber-500",
  },
  "modern-blue": {
    page: "bg-[#0A0E1A] text-white",
    header: "bg-[#0A0E1A]/85 border-slate-800",
    muted: "text-slate-300",
    accent: "text-[#60A5FA]",
    card: "bg-[#121829] border-slate-800",
    badge: "bg-[#0A6CFF]/15 text-[#93C5FD] border-[#0A6CFF]/30",
    primary: "bg-[#0A6CFF] text-white hover:bg-[#085AD4] shadow-lg shadow-[#0A6CFF]/25",
    secondary: "bg-[#182035] text-white border-slate-700 hover:bg-[#202B48]",
    line: "border-slate-800 divide-slate-800",
    star: "text-amber-400",
  },
};

interface LandingRendererProps {
  title: string;
  theme: LandingTheme;
  sections: LandingSection[];
  settings?: LandingPageSettings;
  /** Botões de conversa: abrem o chat do bot vinculado. */
  onChat: () => void;
  /** Endereço da página (usado no selo "feito com Nexo"). */
  slug?: string;
  /** Há bot vinculado: libera "Perguntar ao assistente" na busca da bio. */
  canAsk?: boolean;
  /** Abre o bot com a pergunta já preenchida. */
  onAsk?: (question: string) => void;
  /** Clique em link ou produto (só a página pública conta; a prévia do editor não). */
  onItemClick?: (itemId: string) => void;
  /** Modo editor da bio: tocar no perfil, em um link ou produto seleciona em vez de abrir. */
  onEditSelect?: (target: BioTarget) => void;
  editSelectedId?: string;
}

export type BioTarget = { type: "profile" } | { type: "link"; id: string } | { type: "product"; id: string };

/**
 * Desenha a landing page. Os tamanhos usam container queries (`@container`): a prévia de celular
 * no editor mostra o layout de celular mesmo numa tela grande.
 */
function PageRenderer({ title, theme, sections, settings, onChat }: LandingRendererProps) {
  const t = THEMES[theme] ?? THEMES["modern-blue"];
  const heading = settings?.fontHeading === "serif" ? "font-serif" : "";
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const go = (action: HeroData["ctaAction"] | undefined, link?: string) => {
    if (action === "chat") return onChat();
    if (!link) return;
    if (link.startsWith("#")) {
      rootRef.current?.querySelector(`[data-anchor="${link.slice(1)}"]`)?.scrollIntoView({ behavior: "smooth" });
    } else if (link.startsWith("https://") || link.startsWith("/")) {
      window.open(link, "_blank", "noopener");
    }
  };

  const sectionHeader = (d: { badge?: string; title: string; subtitle?: string }) => (
    <div className="mx-auto max-w-2xl text-center">
      {d.badge && <span className={`inline-block rounded-full border px-3.5 py-1 text-[13px] font-semibold ${t.badge}`}>{d.badge}</span>}
      <h2 className={`mt-3 text-[28px] font-bold leading-tight tracking-tight @2xl:text-4xl ${heading}`}>{d.title}</h2>
      {d.subtitle && <p className={`mt-3 text-base leading-relaxed ${t.muted}`}>{d.subtitle}</p>}
    </div>
  );

  const visible = sections.filter((s) => s.enabled);
  const hasServices = visible.some((s) => s.type === "services");

  return (
    <div ref={rootRef} className={`@container min-h-full w-full ${t.page}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-lg ${t.header}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 @2xl:px-6">
          <span className={`truncate text-lg font-bold tracking-tight ${heading}`}>{title}</span>
          <button type="button" onClick={onChat} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-transform active:scale-95 ${t.primary}`}>
            <MessageCircle size={16} />
            Fale conosco
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-20 pb-24 pt-6 @2xl:gap-24">
        {visible.map((section) => {
          switch (section.type) {
            case "hero": {
              const d = section.data;
              return (
                <section key={section.id} className="mx-auto flex max-w-4xl flex-col items-center px-5 pt-10 text-center @2xl:px-6">
                  {d.badge && (
                    <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold ${t.badge}`}>
                      <Sparkles size={14} />
                      {d.badge}
                    </motion.span>
                  )}
                  <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`text-[34px] font-extrabold leading-[1.1] tracking-tight @2xl:text-5xl @5xl:text-6xl ${heading}`}
                  >
                    {d.headline}
                  </motion.h1>
                  {d.subheadline && <p className={`mt-5 max-w-2xl text-lg leading-relaxed @2xl:text-xl ${t.muted}`}>{d.subheadline}</p>}
                  <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 @md:w-auto @md:flex-row">
                    <button
                      type="button"
                      onClick={() => go(d.ctaAction, d.ctaLink)}
                      className={`flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-base font-bold transition-transform hover:scale-[1.02] active:scale-95 @md:w-auto ${t.primary}`}
                    >
                      {d.ctaAction === "chat" && <MessageCircle size={18} />}
                      {d.ctaText}
                    </button>
                    {d.secondaryCtaText && (d.secondaryCtaLink !== "#servicos" || hasServices) && (
                      <button
                        type="button"
                        onClick={() => go("scroll", d.secondaryCtaLink)}
                        className={`w-full rounded-2xl border px-6 py-3.5 text-base font-semibold transition-transform hover:scale-[1.02] active:scale-95 @md:w-auto ${t.secondary}`}
                      >
                        {d.secondaryCtaText}
                      </button>
                    )}
                  </div>
                  {d.imageUrl?.startsWith("https://") && (
                    <img src={d.imageUrl} alt="" className={`mt-12 w-full max-w-4xl rounded-3xl border object-cover ${t.line}`} loading="lazy" />
                  )}
                </section>
              );
            }

            case "services": {
              const d = section.data;
              return (
                <section key={section.id} data-anchor="servicos" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 @2xl:px-6">
                  {sectionHeader(d)}
                  <div className="mt-10 grid grid-cols-1 gap-5 @2xl:grid-cols-2 @5xl:grid-cols-3">
                    {d.items.map((item) => {
                      const Icon = landingIcon(item.icon);
                      return (
                        <div key={item.id} className={`relative rounded-3xl border p-7 transition-transform hover:-translate-y-1 ${t.card}`}>
                          <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${t.badge}`}>
                            <Icon size={22} />
                          </div>
                          {item.highlight && <span className={`absolute right-6 top-6 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${t.badge}`}>{item.highlight}</span>}
                          <h3 className={`text-xl font-bold tracking-tight ${heading}`}>{item.title}</h3>
                          <p className={`mt-2.5 text-[15px] leading-relaxed ${t.muted}`}>{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            case "features": {
              const d = section.data;
              return (
                <section key={section.id} className="mx-auto w-full max-w-6xl px-5 @2xl:px-6">
                  {sectionHeader(d)}
                  <div className="mt-10 grid grid-cols-1 gap-5 @3xl:grid-cols-3">
                    {d.items.map((item) => (
                      <div key={item.id} className={`rounded-3xl border p-7 text-center ${t.card}`}>
                        {item.statNumber && <div className={`text-4xl font-extrabold tracking-tight ${t.accent}`}>{item.statNumber}</div>}
                        {item.statNumber && item.statLabel && <div className={`mt-1 text-[13px] font-semibold ${t.muted}`}>{item.statLabel}</div>}
                        {!item.statNumber && <CheckCircle2 size={28} className={`mx-auto ${t.accent}`} />}
                        <h3 className={`mt-4 text-lg font-bold ${heading}`}>{item.title}</h3>
                        <p className={`mt-2 text-[15px] leading-relaxed ${t.muted}`}>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            case "testimonials": {
              const d = section.data;
              return (
                <section key={section.id} className="mx-auto w-full max-w-6xl px-5 @2xl:px-6">
                  {sectionHeader(d)}
                  <div className="mt-10 grid grid-cols-1 gap-5 @3xl:grid-cols-2">
                    {d.items.map((item) => (
                      <figure key={item.id} className={`flex flex-col justify-between rounded-3xl border p-7 ${t.card}`}>
                        <div>
                          <div className={`flex gap-1 ${t.star}`} aria-label={`${item.rating} de 5 estrelas`}>
                            {Array.from({ length: item.rating || 5 }).map((_, i) => (
                              <Star key={i} size={16} fill="currentColor" />
                            ))}
                          </div>
                          <blockquote className="mt-4 text-base leading-relaxed">“{item.content}”</blockquote>
                        </div>
                        <figcaption className={`mt-6 border-t pt-4 ${t.line}`}>
                          <p className="text-sm font-bold">{item.author}</p>
                          {(item.role || item.company) && <p className={`text-[13px] ${t.muted}`}>{[item.role, item.company].filter(Boolean).join(", ")}</p>}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              );
            }

            case "faq": {
              const d = section.data;
              return (
                <section key={section.id} className="mx-auto w-full max-w-3xl px-5 @2xl:px-6">
                  {sectionHeader(d)}
                  <div className={`mt-10 divide-y rounded-3xl border ${t.card} ${t.line}`}>
                    {d.items.map((item) => {
                      const open = openFaq === item.id;
                      return (
                        <div key={item.id} className="px-5 py-4">
                          <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setOpenFaq(open ? null : item.id)}
                            className="flex w-full items-center justify-between gap-4 text-left text-base font-semibold"
                          >
                            {item.question}
                            <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <p className={`pt-3 text-[15px] leading-relaxed ${t.muted}`}>{item.answer}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            case "cta": {
              const d = section.data;
              return (
                <section key={section.id} className="mx-auto w-full max-w-5xl px-5 @2xl:px-6">
                  <div className={`rounded-3xl border px-6 py-12 text-center @2xl:px-12 ${t.card}`}>
                    <h2 className={`text-3xl font-extrabold leading-tight @2xl:text-5xl ${heading}`}>{d.headline}</h2>
                    {d.subheadline && <p className={`mx-auto mt-4 max-w-2xl text-lg ${t.muted}`}>{d.subheadline}</p>}
                    <button
                      type="button"
                      onClick={() => go(d.ctaAction, d.ctaLink)}
                      className={`mt-8 inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-lg font-bold transition-transform hover:scale-105 active:scale-95 ${t.primary}`}
                    >
                      {d.ctaAction === "chat" && <MessageCircle size={20} />}
                      {d.ctaText}
                    </button>
                    {d.note && <p className={`mt-4 text-[13px] ${t.muted}`}>{d.note}</p>}
                  </div>
                </section>
              );
            }

            case "links":
              return (
                <section key={section.id} className="mx-auto flex w-full max-w-md flex-col gap-3 px-5">
                  {section.data.items.map((item) => (
                    <LinkButton key={item.id} item={item} t={t} onChat={onChat} onPix={() => undefined} />
                  ))}
                </section>
              );

            case "products":
              return null;

            case "footer": {
              const d = section.data;
              return (
                <footer key={section.id} className={`border-t pt-12 ${t.line}`}>
                  <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 @3xl:flex-row @3xl:items-center @3xl:justify-between @2xl:px-6">
                    <div>
                      <span className={`text-lg font-bold ${heading}`}>{d.companyName}</span>
                      {d.tagline && <p className={`mt-1 text-[13px] ${t.muted}`}>{d.tagline}</p>}
                    </div>
                    {d.links && d.links.length > 0 && (
                      <nav className="flex flex-wrap gap-4 text-[13px] font-medium">
                        {d.links.map((l) => (
                          <button key={l.label + l.url} type="button" onClick={() => go("link", l.url)} className="hover:underline">
                            {l.label}
                          </button>
                        ))}
                      </nav>
                    )}
                    {d.copyright && <p className={`text-[13px] ${t.muted}`}>{d.copyright}</p>}
                  </div>
                </footer>
              );
            }
          }
        })}
      </main>
    </div>
  );
}

const LINK_ICONS: Record<LinkKind, LucideIcon> = {
  chat: MessageCircle,
  whatsapp: Phone,
  instagram: Instagram,
  tiktok: Music2,
  google: Star,
  site: Globe,
  link: Link2,
  pix: QrCode,
  youtube: Youtube,
};

type Palette = (typeof THEMES)[LandingTheme];

/** Endereço do WhatsApp com a mensagem pronta (wa.me/<numero>?text=...). */
const whatsappLink = (url: string, message?: string) => (message?.trim() ? `${url}?text=${encodeURIComponent(message.trim())}` : url);

interface LinkButtonProps {
  item: LinkItem;
  t: Palette;
  onChat: () => void;
  onPix: (item: LinkItem) => void;
  onClick?: (id: string) => void;
  primary?: boolean;
}

function LinkButton({ item, t, onChat, onPix, onClick, primary }: LinkButtonProps) {
  const Icon = LINK_ICONS[item.kind] ?? Link2;
  const className = `flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-5 py-3.5 text-left text-[16px] font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] ${primary ? t.primary : t.secondary}`;
  const content = (
    <>
      <Icon size={20} className="shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
    </>
  );
  if (item.kind === "chat" || item.kind === "pix") {
    return (
      <button
        type="button"
        onClick={() => {
          onClick?.(item.id);
          if (item.kind === "chat") onChat();
          else onPix(item);
        }}
        className={className}
      >
        {content}
      </button>
    );
  }
  const href = item.kind === "whatsapp" ? whatsappLink(item.url ?? "", item.message) : item.url;
  return href?.startsWith("https://") ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => onClick?.(item.id)} className={className}>
      {content}
    </a>
  ) : null;
}

function ProductCard({ product, t, onClick }: { product: ProductItem; t: Palette; onClick?: (id: string) => void }) {
  const actions: { key: string; label: string; href: string }[] = [];
  if (product.mercadoLivreUrl?.startsWith("https://")) actions.push({ key: "ml", label: "Comprar no Mercado Livre", href: product.mercadoLivreUrl });
  if (product.shopeeUrl?.startsWith("https://")) actions.push({ key: "sp", label: "Comprar na Shopee", href: product.shopeeUrl });
  if (product.whatsappUrl?.startsWith("https://")) {
    actions.push({ key: "wa", label: "Comprar pelo WhatsApp", href: whatsappLink(product.whatsappUrl, product.whatsappMessage?.trim() || `Olá! Tenho interesse em ${product.name}.`) });
  }
  return (
    <article className={`overflow-hidden rounded-2xl border text-left ${t.card}`}>
      {product.imageUrl?.startsWith("https://") && <img src={product.imageUrl} alt={product.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />}
      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-[16px] font-bold leading-snug">{product.name}</h3>
          {product.price && <p className={`mt-0.5 text-[15px] font-semibold ${t.accent}`}>{product.price}</p>}
        </div>
        {actions.length > 0 && (
          <div className="flex flex-col gap-2">
            {actions.map((a) => (
              <a
                key={a.key}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onClick?.(product.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-[14px] font-semibold transition-transform active:scale-[0.98] ${t.secondary}`}
              >
                {a.key === "wa" ? <Phone size={16} /> : <ShoppingBag size={16} />}
                {a.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? "https://nexo.app";

/** Link na bio: coluna estreita para o celular, com busca, links, produtos, Pix e o bot. */
function BioRenderer({ title, theme, sections, settings, slug, canAsk, onChat, onAsk, onItemClick, onEditSelect, editSelectedId }: LandingRendererProps) {
  const t = THEMES[theme] ?? THEMES["modern-blue"];
  const heading = settings?.fontHeading === "serif" ? "font-serif" : "";
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [pix, setPix] = useState<LinkItem | null>(null);
  const searchId = useId();
  const visible = sections.filter((s) => s.enabled);
  const hero = visible.find((s): s is Extract<LandingSection, { type: "hero" }> => s.type === "hero")?.data;
  const links = visible.find((s): s is Extract<LandingSection, { type: "links" }> => s.type === "links")?.data.items ?? [];
  const productsSection = visible.find((s): s is Extract<LandingSection, { type: "products" }> => s.type === "products")?.data;
  const products = productsSection?.items ?? [];
  const footer = visible.find((s): s is Extract<LandingSection, { type: "footer" }> => s.type === "footer")?.data;
  const name = hero?.headline || title;
  const initials = name.split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const firstChat = links.findIndex((l) => l.kind === "chat");

  const words = fold(query).split(/\s+/).filter(Boolean);
  const matches = (text: string) => {
    const hay = fold(text);
    return words.every((w) => hay.includes(w));
  };
  const shownLinks = words.length ? links.filter((l) => matches(`${l.label} ${l.message ?? ""}`)) : links;
  const shownProducts = words.length ? products.filter((p) => matches(`${p.name} ${p.price ?? ""}`)) : products;
  const empty = words.length > 0 && shownLinks.length === 0 && shownProducts.length === 0;
  const showBadge = settings?.showBadge !== false;
  // No editor, o toque seleciona o item (a fase de captura impede abrir o link de verdade).
  const pick = (target: BioTarget) =>
    onEditSelect
      ? {
          onClickCapture: (e: { preventDefault: () => void; stopPropagation: () => void }) => {
            e.preventDefault();
            e.stopPropagation();
            onEditSelect(target);
          },
        }
      : {};
  const ring = (id: string) => (onEditSelect ? `rounded-2xl transition-shadow ${editSelectedId === id ? "ring-2 ring-[#FFC400]" : "hover:ring-2 hover:ring-white/30"}` : "");

  return (
    <div className={`@container min-h-full w-full ${t.page}`}>
      <div className="mx-auto flex min-h-full max-w-[460px] flex-col items-center px-4 pb-8 pt-12 text-center">
        <div className={`flex w-full flex-col items-center ${ring("profile")}`} {...pick({ type: "profile" })}>
        <motion.span
          initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`flex h-24 w-24 items-center justify-center rounded-full border-4 text-[32px] font-extrabold ${t.primary} ${t.line}`}
          aria-hidden
        >
          {hero?.imageUrl?.startsWith("https://") ? <img src={hero.imageUrl} alt="" className="h-full w-full rounded-full object-cover" /> : initials}
        </motion.span>
        <h1 className={`mt-5 break-words text-[26px] font-extrabold leading-tight tracking-tight ${heading}`}>{name}</h1>
        {hero?.badge && <p className={`mt-1 text-[14px] font-semibold ${t.accent}`}>{hero.badge}</p>}
        {hero?.subheadline && <p className={`mt-2 text-[15px] leading-relaxed ${t.muted}`}>{hero.subheadline}</p>}
        </div>

        {(links.length > 0 || products.length > 0) && (
          <div className="mt-6 w-full">
            <label htmlFor={searchId} className="sr-only">
              Procurando algo?
            </label>
            <div className={`flex min-h-12 items-center gap-2 rounded-2xl border pl-4 pr-1 ${t.card}`}>
              <Search size={18} className={`shrink-0 ${t.muted}`} />
              <input
                id={searchId}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Procurando algo?"
                className="min-w-0 flex-1 bg-transparent py-3 text-[16px] outline-none placeholder:opacity-60"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="flex h-11 w-11 shrink-0 items-center justify-center">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex w-full flex-col gap-3">
          {shownLinks.map((item, i) => (
            <motion.div key={item.id} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: words.length ? 0 : 0.1 + i * 0.06 }} className={ring(item.id)} {...pick({ type: "link", id: item.id })}>
              <LinkButton item={item} t={t} onChat={onChat} onPix={setPix} onClick={onItemClick} primary={!words.length && i === firstChat} />
            </motion.div>
          ))}

          {shownProducts.length > 0 && (
            <>
              <h2 className={`mt-3 text-left text-[18px] font-bold ${heading}`}>{productsSection?.title || "Produtos"}</h2>
              {shownProducts.map((p) => (
                <div key={p.id} className={ring(p.id)} {...pick({ type: "product", id: p.id })}>
                  <ProductCard product={p} t={t} onClick={onItemClick} />
                </div>
              ))}
            </>
          )}

          {empty && (
            <div className={`rounded-2xl border p-5 ${t.card}`} role="status">
              <p className="text-[15px] font-semibold">Não encontrei nada para "{query.trim()}".</p>
              {canAsk ? (
                <button
                  type="button"
                  onClick={() => onAsk?.(query.trim())}
                  className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold ${t.primary}`}
                >
                  <MessageCircle size={18} />
                  Perguntar ao assistente
                </button>
              ) : (
                <p className={`mt-1 text-[13px] ${t.muted}`}>Tente outra palavra.</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 pt-12">
          {footer?.companyName && <span className={`text-[12px] font-semibold ${t.muted}`}>{footer.companyName}</span>}
          {showBadge && (
            <a
              href={`${SITE_URL}?ref=${encodeURIComponent(slug ?? "")}`}
              target="_blank"
              rel="noopener"
              className={`group inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[12px] opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 ${t.muted}`}
            >
              <span className="transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none">
                <LogoMark size={16} />
              </span>
              feito com Nexo
            </a>
          )}
        </div>
      </div>
      {pix && <PixDialog item={pix} cardClass={t.card} mutedClass={t.muted} buttonClass={t.primary} onClose={() => setPix(null)} />}
    </div>
  );
}

/** Desenha a página no formato escolhido: landing page completa ou link na bio. */
export function LandingRenderer(props: LandingRendererProps) {
  return props.settings?.layout === "bio" ? <BioRenderer {...props} /> : <PageRenderer {...props} />;
}
