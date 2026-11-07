import { ArrowLeft, Behance, CheckCircle2, ChevronDown, Discord, Facebook, Github, Globe, type IconComponent, Instagram, Link2, Linkedin, Pinterest, Telegram, Threads, XSocial, MessageCircle, Music2, Phone, QrCode, Search, ShoppingBag, Sparkles, Spotify, Star, WhatsApp, X, Youtube } from "../../../shared/icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { SealPill } from "../../../shared/components/ui/NexoSeal";
import type { HeroData, LandingPageSettings, LandingSection, LandingTheme, LinkItem, LinkKind, OpenStatus, ProductItem } from "../contract";
import { isSocialKind } from "../contract";
import { AnimatedIcon } from "../AnimatedIcon";
import { landingIcon } from "../icons";
import { BioSplash } from "./BioSplash";
import { fold } from "../schedule";
import { PixDialog } from "./PixDialog";
import { Backdrop } from "../look/Backdrop";
import { loadFont } from "../look/fonts";
import { buttonClass, PALETTE, type Palette, resolveLook } from "../look/resolve";
import { getTheme } from "../look/themes";
import type { ButtonShape, ButtonStyle } from "../look/types";
import { imageSrc, isImageUrl } from "../../uploads/image";
import { JourneyView } from "../journey/JourneyView";
import type { Journey } from "../journey/useJourney";

// As páginas dos clientes têm paletas próprias (não seguem o tema do painel): ver ../look.
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
  /** Bio em modo jornada: abre na conversa. Sem isto (ou se ela falhar), abre nos links. */
  journey?: Journey;
  /** Aberto ou fechado agora, para quem usa a agenda. */
  openStatus?: OpenStatus | null;
}

export type BioTarget = { type: "profile" } | { type: "link"; id: string } | { type: "product"; id: string };

/**
 * Desenha a landing page. Os tamanhos usam container queries (`@container`): a prévia de celular
 * no editor mostra o layout de celular mesmo numa tela grande.
 */
function PageRenderer({ title, theme, sections, settings, onChat }: LandingRendererProps) {
  const t = PALETTE;
  // A landing page completa usa só as cores do tema (a letra é a Moderna ou a Clássica do editor).
  const look = resolveLook(getTheme(theme), { font: settings?.fontHeading === "serif" ? "serif" : "inter" });
  const heading = "font-display";
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
    <div ref={rootRef} className={`nx-landing @container min-h-full w-full ${t.page}`} style={look.vars}>
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
                  {isImageUrl(d.imageUrl) && (
                    <img src={imageSrc(d.imageUrl)} alt="" className={`mt-12 w-full max-w-4xl rounded-3xl border object-cover ${t.line}`} loading="lazy" />
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
                    <LinkButton key={item.id} item={item} t={t} look={{ style: "filled", shape: "rounded" }} onChat={onChat} onPix={() => undefined} />
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
                    <div className="flex flex-col gap-1">
                      {d.copyright && <p className={`text-[13px] ${t.muted}`}>{d.copyright}</p>}
                      {/* Os visitantes podem deixar dados no chat: link para a política do Nexo (operador). */}
                      <a href="/privacidade" target="_blank" rel="noopener" className={`text-[12px] underline-offset-2 hover:underline ${t.muted}`}>
                        Privacidade
                      </a>
                    </div>
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

const hostOf = (url?: string) => {
  try {
    return new URL(url ?? "").hostname;
  } catch {
    return "";
  }
};

const LINK_ICONS: Record<LinkKind, IconComponent> = {
  chat: MessageCircle,
  whatsapp: WhatsApp,
  instagram: Instagram,
  tiktok: Music2,
  google: Star,
  site: Globe,
  link: Link2,
  pix: QrCode,
  youtube: Youtube,
  linkedin: Linkedin,
  spotify: Spotify,
  facebook: Facebook,
  x: XSocial,
  threads: Threads,
  pinterest: Pinterest,
  telegram: Telegram,
  github: Github,
  discord: Discord,
  behance: Behance,
};


/** Endereço do WhatsApp com a mensagem pronta (wa.me/<numero>?text=...). */
const whatsappLink = (url: string, message?: string) => (message?.trim() ? `${url}?text=${encodeURIComponent(message.trim())}` : url);

interface LinkButtonProps {
  item: LinkItem;
  t: Palette;
  look: { style: ButtonStyle; shape: ButtonShape };
  onChat: () => void;
  onPix: (item: LinkItem) => void;
  onClick?: (id: string) => void;
  primary?: boolean;
}

function LinkButton({ item, look, onChat, onPix, onClick, primary }: LinkButtonProps) {
  const Icon = (item.kind === "link" && /(^|\.)spotify\.(com|link)$/.test(hostOf(item.url))) ? Spotify : (LINK_ICONS[item.kind] ?? Link2);
  const className = `flex min-h-[52px] w-full items-center gap-3 px-5 py-3.5 text-left text-[16px] font-semibold transition-[transform,box-shadow] hover:scale-[1.02] active:scale-[0.98] ${buttonClass(look.style, look.shape, primary)}`;
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
      {isImageUrl(product.imageUrl) && <img src={imageSrc(product.imageUrl)} alt={product.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />}
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
function BioRenderer({ title, theme, sections, settings, slug, canAsk, onChat, onAsk, onItemClick, onEditSelect, editSelectedId, journey, openStatus }: LandingRendererProps) {
  const t = PALETTE;
  const look = resolveLook(getTheme(theme), settings?.look, settings?.fontHeading);
  const buttons = { style: look.buttonStyle, shape: look.buttonShape };
  const heading = "font-display";
  useEffect(() => loadFont(look.font), [look.font]);
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [pix, setPix] = useState<LinkItem | null>(null);
  const [linksOpen, setLinksOpen] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const opening = Boolean(journey) && !onEditSelect;
  // Fica o bastante para a marca aparecer, mesmo com a resposta rápida.
  useEffect(() => {
    if (!opening) return;
    const timer = setTimeout(() => setSplashDone(true), reduceMotion ? 0 : 1200);
    return () => clearTimeout(timer);
  }, [opening, reduceMotion]);
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
  // Redes sociais viram ícones no perfil; só voltam para a lista quando a pessoa busca.
  const socials = links.filter((l) => isSocialKind(l.kind) && l.url?.startsWith("https://"));
  const editing = Boolean(onEditSelect);
  const hasJourney = Boolean(journey && journey.status !== "failed");
  // No editor, escolher um link ou produto mostra a lista, onde ele aparece selecionado.
  const inConversation = hasJourney && !linksOpen && !(editSelectedId && editSelectedId !== "profile");
  // No celular, depois da primeira resposta o perfil encolhe: a etapa é que importa. No computador ele tem coluna própria.
  const compact = inConversation && Boolean(journey?.entries.some((e) => e.from === "user"));
  const whenFull = compact ? "hidden @4xl:flex" : "flex";
  const openChat = () => (hasJourney ? setLinksOpen(false) : onChat());
  const askQuestion = (question: string) => {
    if (hasJourney) setLinksOpen(false);
    onAsk?.(question);
  };

  const words = fold(query).split(/\s+/).filter(Boolean);
  const matches = (text: string) => {
    const hay = fold(text);
    return words.every((w) => hay.includes(w));
  };
  const shownLinks = words.length ? links.filter((l) => matches(`${l.label} ${l.message ?? ""}`)) : links.filter((l) => !socials.includes(l));
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
    <div className={`nx-landing @container relative isolate min-h-full w-full ${t.page}`} style={look.vars}>
      <Backdrop bg={look.bg} />
      <div className={`mx-auto flex min-h-full max-w-[460px] flex-col items-center px-4 pb-8 ${isImageUrl(hero?.coverUrl) ? "pt-4" : "pt-10"} text-center ${hasJourney ? "@4xl:grid @4xl:max-w-5xl @4xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] @4xl:grid-rows-[auto_1fr] @4xl:items-start @4xl:gap-x-14 @4xl:px-8 @4xl:pt-20" : ""}`}>
        <div className={`flex w-full flex-col items-center ${hasJourney ? "@4xl:sticky @4xl:top-20" : ""} ${ring("profile")}`} {...pick({ type: "profile" })}>
        {isImageUrl(hero?.coverUrl) && (
          <motion.span initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} className="mb-[-52px] block aspect-[5/2] w-full overflow-hidden rounded-3xl">
            <img src={imageSrc(hero.coverUrl)} alt="" className="h-full w-full object-cover" />
          </motion.span>
        )}
        <motion.span initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 18 }} className={`relative flex h-[108px] w-[108px] items-center justify-center transition-transform duration-300 ${compact ? "-mb-6 origin-top scale-[0.6] @4xl:mb-0 @4xl:scale-100" : ""}`} aria-hidden>
          {/* O anel gira devagar nas cores do tema: é o que faz o perfil parecer vivo. */}
          <motion.span animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 7, ease: "linear", repeat: Infinity }} className="absolute inset-0 rounded-full [background:conic-gradient(from_0deg,var(--t-accent),transparent_35%,var(--t-accent)_60%,transparent_85%,var(--t-accent))]" />
          <span className="absolute inset-[3px] rounded-full bg-[var(--t-page)]" />
          <motion.span animate={reduceMotion ? undefined : { y: [0, -3, 0] }} transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }} className={`relative flex h-[94px] w-[94px] items-center justify-center overflow-hidden rounded-full text-[32px] font-extrabold ${t.primary}`}>
            {isImageUrl(hero?.imageUrl) ? <img src={imageSrc(hero.imageUrl)} alt="" className="h-full w-full object-cover" /> : initials}
          </motion.span>
        </motion.span>
        <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className={`mt-4 break-words font-extrabold leading-tight tracking-tight ${compact ? "text-[20px] @4xl:text-[26px]" : "text-[26px]"} ${heading}`}>{name}</motion.h1>
        {hero?.badge && <p className={`mt-1 text-[14px] font-semibold ${t.accent}`}>{hero.badge}</p>}
        {openStatus && (
          <motion.span initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 24, delay: 0.16 }} className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold ${t.card}`}>
            <span className="relative flex h-2 w-2">
              {openStatus.open && !reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${openStatus.open ? "bg-emerald-400" : "bg-[var(--t-muted)]"}`} />
            </span>
            {openStatus.open ? `Aberto até ${openStatus.until}` : openStatus.next ? `Fechado · abre ${openStatus.next}` : "Fechado agora"}
          </motion.span>
        )}
        {hero?.subheadline && <motion.p initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }} className={`mt-2.5 text-[15px] leading-relaxed ${compact ? "hidden @4xl:block" : ""} ${t.muted}`}>{hero.subheadline}</motion.p>}
        {socials.length > 0 && (
          <div className={`mt-3.5 flex-wrap justify-center gap-2 ${whenFull}`}>
            {socials.map((item, i) => {
              const Icon = LINK_ICONS[item.kind] ?? Link2;
              return (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => onItemClick?.(item.id)}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.4, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 460, damping: 20, delay: 0.24 + i * 0.06 }}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.12, rotate: i % 2 ? 6 : -6 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border ${t.card} ${editing ? ring(item.id) : ""}`}
                  {...pick({ type: "link", id: item.id })}
                >
                  {/* Um de cada vez, num balanço leve, para o olho ir até as redes sem cansar. */}
                  <AnimatedIcon icon={Icon} motion="float" size={19} delay={i * 0.35} />
                </motion.a>
              );
            })}
          </div>
        )}
        {hero?.highlights && hero.highlights.length > 0 && (
          <ul aria-label="Destaques" className={`mt-3 flex-wrap justify-center gap-1.5 ${whenFull}`}>
            {hero.highlights.map((h, i) => (
              <motion.li key={h} initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 26, delay: 0.2 + i * 0.05 }} className={`rounded-full border px-2.5 py-1 text-[12.5px] font-semibold ${t.badge}`}>
                {h}
              </motion.li>
            ))}
          </ul>
        )}
        </div>

        <div className={`flex w-full flex-col items-center ${hasJourney ? "@4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1" : ""}`}>
        {inConversation && journey && <JourneyView journey={journey} t={t} optionClass={buttonClass(buttons.style, buttons.shape)} onViewLinks={links.length > 0 || products.length > 0 ? () => setLinksOpen(true) : undefined} />}

        {!inConversation && hasJourney && (
          <button type="button" onClick={() => setLinksOpen(false)} className={`mt-5 flex min-h-11 items-center gap-1.5 self-start text-[14px] font-semibold ${t.muted}`}>
            <ArrowLeft size={16} />
            Voltar para a conversa
          </button>
        )}

        {!inConversation && (links.length > 0 || products.length > 0) && (
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

        {!inConversation && <div className="mt-5 flex w-full flex-col gap-3">
          {shownLinks.map((item, i) => (
            <motion.div key={item.id} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: words.length ? 0 : 0.1 + i * 0.06 }} className={ring(item.id)} {...pick({ type: "link", id: item.id })}>
              <LinkButton item={item} t={t} look={buttons} onChat={openChat} onPix={setPix} onClick={onItemClick} primary={!words.length && item.id === links[firstChat]?.id} />
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
                  onClick={() => askQuestion(query.trim())}
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
        </div>}
        </div>

        <div className={`mt-auto flex flex-col items-center gap-2 pt-12 ${hasJourney ? "@4xl:col-start-1 @4xl:row-start-2 @4xl:mt-0 @4xl:pt-8" : ""}`}>
          {footer?.companyName && <span className={`text-[12px] font-semibold ${t.muted}`}>{footer.companyName}</span>}
          {showBadge && <SealPill href={`${SITE_URL}?via=selo&ref=${encodeURIComponent(slug ?? "")}`} className="my-2" />}
          {/* Os visitantes podem deixar dados no chat: link para a política do Nexo (operador). */}
          <a href="/privacidade" target="_blank" rel="noopener" className={`inline-flex min-h-8 items-center px-2 text-[12px] underline-offset-2 hover:underline ${t.muted}`}>
            Privacidade
          </a>
        </div>
      </div>
      <AnimatePresence>{opening && journey?.status !== "failed" && (!splashDone || journey?.status === "loading") && <BioSplash key="splash" name={name} initials={initials} imageUrl={hero?.imageUrl} />}</AnimatePresence>
      {pix && <PixDialog item={pix} cardClass={t.card} mutedClass={t.muted} buttonClass={t.primary} onClose={() => setPix(null)} />}
    </div>
  );
}

/** Desenha a página no formato escolhido: landing page completa ou link na bio. */
export function LandingRenderer(props: LandingRendererProps) {
  return props.settings?.layout === "bio" ? <BioRenderer {...props} /> : <PageRenderer {...props} />;
}
