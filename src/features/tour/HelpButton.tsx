import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Sheet } from "../../shared/components/ui/Sheet";
import { inputClass } from "../../shared/components/ui/styles";
import { BookOpen, ChevronDown, ChevronRight, HelpCircle, Play, Search } from "../../shared/icons";
import { startTour, TOUR_STEPS } from "./driver-service";
import { type HelpTopic, searchHelp } from "./helpTopics";
import type { TourKey } from "./tour-store";

interface HelpButtonProps {
  tourKey: TourKey;
  screenTitle?: string;
}

function Topic({ topic, open, onToggle, onGo }: { topic: HelpTopic; open: boolean; onToggle: () => void; onGo: (to: string) => void }) {
  return (
    <li className="rounded-xl border border-border-ui/70 bg-panel">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[14px] font-semibold text-text-primary">
        {topic.q}
        <ChevronDown size={16} className={`shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 px-3 pb-3">
              <p className="text-[14px] leading-relaxed text-text-secondary">{topic.a}</p>
              {topic.to && (
                <button type="button" onClick={() => onGo(topic.to!)} className="flex items-center gap-1 self-start text-[13.5px] font-semibold text-primary-strong hover:underline">
                  {topic.toLabel} <ChevronRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Ajuda de cada tela: o tour guiado dela e as dúvidas frequentes da jornada, com busca. */
export function HelpButton({ tourKey, screenTitle }: HelpButtonProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const groups = searchHelp(query);
  const hasTour = TOUR_STEPS[tourKey].length > 0;

  const go = (to: string) => {
    setFaqOpen(false);
    void navigate({ to });
  };
  const item = "flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13.5px] font-semibold text-text-primary transition-colors hover:bg-primary/10 md:min-h-9";

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          className="flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl border border-border-ui bg-panel-2 px-2.5 text-xs font-semibold text-text-secondary transition-all hover:border-primary/40 hover:bg-panel-hover hover:text-text-primary sm:h-8 sm:px-3"
          title="Ajuda"
          aria-label="Ajuda"
        >
          <HelpCircle size={15} className="text-primary" />
          <span className="hidden 2xl:inline">Ajuda</span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border-ui bg-panel p-2 shadow-float"
              >
                <p className="px-3 pb-1.5 pt-1 text-[12.5px] font-semibold text-text-secondary">Ajuda{screenTitle ? ` · ${screenTitle}` : ""}</p>
                {hasTour && (
                  <button
                    type="button"
                    className={item}
                    onClick={() => {
                      setMenuOpen(false);
                      startTour(tourKey, true);
                    }}
                  >
                    <Play size={15} className="text-primary" /> Ver o passo a passo desta tela
                  </button>
                )}
                <button
                  type="button"
                  className={item}
                  onClick={() => {
                    setMenuOpen(false);
                    setFaqOpen(true);
                  }}
                >
                  <BookOpen size={15} className="text-primary" /> Dúvidas frequentes
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Sheet
        open={faqOpen}
        title="Dúvidas frequentes"
        onClose={() => setFaqOpen(false)}
        width="md"
        footer={<p className="text-[13px] leading-snug text-text-secondary">Não achou? Conte a sua dúvida em <b>Dar opinião</b>, no menu da sua conta. A resposta chega no seu e-mail.</p>}
      >
        <div className="flex flex-col gap-4">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar: agenda, Instagram, QR..." aria-label="Buscar nas dúvidas" />
          </label>
          {groups.length === 0 && <p className="py-6 text-center text-[14px] text-text-secondary">Nada encontrado para &ldquo;{query}&rdquo;.</p>}
          {groups.map((g) => (
            <section key={g.title} className="flex flex-col gap-2">
              <h3 className="text-[13px] font-semibold text-text-secondary">{g.title}</h3>
              <ul className="flex flex-col gap-1.5">
                {g.topics.map((t) => (
                  <Topic key={t.q} topic={t} open={openTopic === t.q} onToggle={() => setOpenTopic(openTopic === t.q ? null : t.q)} onGo={go} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Sheet>
    </>
  );
}
