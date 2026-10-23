import { CheckCircle2, ChevronDown, MessageCircle, Sparkles, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { HeroData, LandingPageSettings, LandingSection, LandingTheme } from "../contract";
import { landingIcon } from "../icons";

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
}

/**
 * Desenha a landing page. Os tamanhos usam container queries (`@container`): a prévia de celular
 * no editor mostra o layout de celular mesmo numa tela grande.
 */
export function LandingRenderer({ title, theme, sections, settings, onChat }: LandingRendererProps) {
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
