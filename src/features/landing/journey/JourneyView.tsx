import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type FormEvent, Fragment, useEffect, useRef, useState } from "react";
import type { OutboundMessage } from "../../../api/mutations/useSimulator";
import { ArrowRight, Check, RefreshCw, Send, WhatsApp } from "../../../shared/icons";
import { imageSrc, isImageUrl } from "../../uploads/image";
import { AnimatedIcon } from "../AnimatedIcon";
import { landingIcon } from "../icons";
import type { Palette } from "../look/resolve";
import type { Journey, JourneyEntry } from "./useJourney";

type ButtonsMessage = Extract<OutboundMessage, { type: "buttons" }>;
type Option = ButtonsMessage["options"][number];

const spring = { type: "spring", stiffness: 420, damping: 30 } as const;
const SECONDARY = new Set(["mais", "voltar"]);
const WEEK = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** A pergunta entra palavra por palavra: a conversa parece estar acontecendo, sem fazer ninguém esperar. */
function Headline({ text, reduce }: { text: string; reduce: boolean | null }) {
  if (reduce) return <h2 className="font-display text-[23px] font-bold leading-tight tracking-tight @xl:text-[28px]">{text}</h2>;
  return (
    <h2 aria-label={text} className="font-display text-[23px] font-bold leading-tight tracking-tight @xl:text-[28px]">
      {text.split(/\s+/).map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span aria-hidden initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.28, delay: Math.min(i, 18) * 0.035 }} className="inline-block">
            {word}
          </motion.span>{" "}
        </Fragment>
      ))}
    </h2>
  );
}

/** Ícone numa peça com a cor da marca do cliente. Sem foto, ainda é um cartão bonito. */
function IconTile({ name, iconMotion, t, large }: { name?: string; iconMotion?: string; t: Palette; large?: boolean }) {
  const Icon = landingIcon(name ?? "Sparkles");
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${large ? "h-14 w-14" : "h-12 w-12"} ${t.primary}`}>
      <motion.span whileHover={{ rotate: [0, -10, 10, 0], scale: 1.12 }} transition={{ duration: 0.45 }} className="flex">
        <AnimatedIcon icon={Icon} motion={iconMotion} size={large ? 26 : 22} />
      </motion.span>
    </span>
  );
}

function ServiceCard({ option, t, chosen, dimmed, disabled, onPick, index, reduce }: { option: Option; t: Palette; chosen: boolean; dimmed: boolean; disabled: boolean; onPick: () => void; index: number; reduce: boolean | null }) {
  const photo = isImageUrl(option.imageUrl) ? option.imageUrl : undefined;
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onPick}
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: dimmed ? 0.35 : 1, y: 0, scale: chosen ? 1.02 : dimmed ? 0.98 : 1 }}
      transition={{ ...spring, delay: reduce || chosen || dimmed ? 0 : 0.12 + index * 0.05 }}
      whileHover={reduce || disabled ? undefined : { y: -3 }}
      whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left shadow-sm ${t.card} ${chosen ? "ring-2 ring-[var(--t-accent)]" : ""}`}
    >
      {photo && (
        <span className="block aspect-[16/9] w-full overflow-hidden">
          <img src={imageSrc(photo)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </span>
      )}
      <span className="flex items-center gap-3 p-3">
        {!photo && <IconTile name={option.icon} iconMotion={option.iconMotion} t={t} />}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[16px] font-bold leading-snug">{option.label}</span>
          {option.description && <span className={`text-[13.5px] leading-snug ${t.muted}`}>{option.description}</span>}
          {option.note && <span className={`mt-0.5 text-[13.5px] font-semibold ${t.accent}`}>{option.note}</span>}
        </span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${chosen ? t.primary : t.muted}`}>{chosen ? <Check size={17} /> : <ArrowRight size={17} />}</span>
      </span>
    </motion.button>
  );
}

function DateTile({ option, t, chosen, dimmed, disabled, onPick, index, reduce }: { option: Option; t: Palette; chosen: boolean; dimmed: boolean; disabled: boolean; onPick: () => void; index: number; reduce: boolean | null }) {
  const d = new Date(`${option.id}T12:00:00Z`);
  const relative = option.label === "Hoje" || option.label === "Amanhã";
  return (
    <motion.button
      type="button"
      disabled={disabled}
      aria-label={option.label}
      onClick={onPick}
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.92 }}
      animate={{ opacity: dimmed ? 0.35 : 1, y: 0, scale: chosen ? 1.06 : 1 }}
      transition={{ ...spring, delay: reduce || chosen || dimmed ? 0 : 0.1 + index * 0.035 }}
      whileHover={reduce || disabled ? undefined : { y: -3 }}
      whileTap={reduce || disabled ? undefined : { scale: 0.94 }}
      className={`flex min-h-[86px] flex-col items-center justify-center gap-0.5 rounded-2xl border px-1 ${chosen ? t.primary : t.card}`}
    >
      <span className={`text-[12.5px] font-semibold ${chosen ? "" : relative ? t.accent : t.muted}`}>{relative ? option.label : WEEK[d.getUTCDay()]}</span>
      <span className="font-display text-[26px] font-bold leading-none tabular-nums">{d.getUTCDate()}</span>
      <span className={`text-[12px] ${chosen ? "" : t.muted}`}>{MONTHS[d.getUTCMonth()]}</span>
    </motion.button>
  );
}

function TimeChip({ option, t, chosen, dimmed, disabled, onPick, index, reduce }: { option: Option; t: Palette; chosen: boolean; dimmed: boolean; disabled: boolean; onPick: () => void; index: number; reduce: boolean | null }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onPick}
      initial={reduce ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: dimmed ? 0.35 : 1, scale: chosen ? 1.08 : 1 }}
      transition={{ ...spring, delay: reduce || chosen || dimmed ? 0 : 0.08 + index * 0.025 }}
      whileHover={reduce || disabled ? undefined : { y: -2 }}
      whileTap={reduce || disabled ? undefined : { scale: 0.92 }}
      className={`min-h-12 rounded-xl border text-[16px] font-bold tabular-nums ${chosen ? t.primary : t.card}`}
    >
      {option.label}
    </motion.button>
  );
}

/** Sucesso de verdade: o traço do visto se desenha e a cor da marca explode em volta. */
function Celebration({ t, burst, reduce }: { t: Palette; burst: boolean; reduce: boolean | null }) {
  const pieces = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const distance = 64 + ((i * 37) % 44);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, round: i % 3 === 0, rotate: (i * 67) % 360 };
  });
  return (
    <div className="relative flex h-24 items-center justify-center" aria-hidden>
      {burst &&
        !reduce &&
        pieces.map((p, i) => (
          <motion.span key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }} animate={{ x: p.x, y: p.y + 14, opacity: [1, 1, 0], scale: 1, rotate: p.rotate }} transition={{ duration: 1.5, ease: [0.16, 0.9, 0.3, 1], delay: 0.18, opacity: { duration: 1.5, times: [0, 0.65, 1], delay: 0.18 } }} className={`absolute h-2.5 w-2.5 ${p.round ? "rounded-full" : "rounded-[3px]"} ${i % 2 ? "bg-[var(--t-accent)]" : "[background:var(--t-cta)]"}`} />
        ))}
      <motion.span initial={reduce || !burst ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 340, damping: 16 }} className={`relative flex h-[76px] w-[76px] items-center justify-center rounded-full ${t.primary}`}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <motion.path d="M5 12.5l4.6 4.6L19 7.7" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" initial={reduce || !burst ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.14 }} />
        </svg>
      </motion.span>
    </div>
  );
}

const textOf = (m: OutboundMessage) => (m.type === "text" || m.type === "buttons" || m.type === "link" ? m.text : (m.caption ?? ""));

/**
 * A jornada como experiência, não como chat: uma etapa por vez, com a pergunta em destaque, cartões, dias e horários
 * para tocar, o caminho já percorrido em cima e uma tela de sucesso no fim. Roda sobre as mesmas mensagens do motor.
 */
export function JourneyView({ journey, t, optionClass, onViewLinks }: { journey: Journey; t: Palette; optionClass: string; onViewLinks?: () => void }) {
  const { entries, status, busy, error } = journey;
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const topRef = useRef<HTMLElement>(null);
  const seen = useRef(0);
  const [wasWaiting, setWasWaiting] = useState(status === "waiting");
  const [burst, setBurst] = useState(false);
  if (status === "waiting" && !wasWaiting) setWasWaiting(true);
  // Só comemora quando termina aqui e agora: voltar do WhatsApp com a página recarregada não repete a festa.
  if (status === "completed" && wasWaiting) {
    setWasWaiting(false);
    setBurst(true);
  }

  const lastUser = entries.map((e) => e.from).lastIndexOf("user");
  const stageEntries: JourneyEntry[] = entries.slice(lastUser + 1);
  const answers = entries.filter((e) => e.from === "user");
  const stageKey = `${answers.length}-${status === "loading" ? "l" : ""}`;
  const buttons = [...stageEntries].reverse().find((e) => e.message.type === "buttons")?.message as ButtonsMessage | undefined;
  const options = status === "waiting" && buttons ? buttons.options : [];
  const main = options.filter((o) => !SECONDARY.has(o.id));
  const secondary = options.filter((o) => SECONDARY.has(o.id));
  const texts = stageEntries.map((e) => e.message).filter((m) => m.type === "text" && m.text);
  const headlineText = buttons?.text || (status === "waiting" ? textOf(texts.at(-1) ?? { type: "text", text: "" }) : "");
  const leads = status === "waiting" ? (buttons ? texts : texts.slice(0, -1)) : texts;
  const images = stageEntries.map((e) => e.message).filter((m): m is Extract<OutboundMessage, { type: "image" }> => m.type === "image");
  const links = stageEntries.map((e) => e.message).filter((m): m is Extract<OutboundMessage, { type: "link" }> => m.type === "link");
  const display = buttons?.display;
  const finished = status === "completed";
  // Sem saber o tamanho do caminho, a barra anda sempre e só completa no fim.
  const progress = finished ? 100 : Math.min(92, Math.round((1 - 1 / (answers.length + 1.6)) * 100));

  useEffect(() => {
    if (seen.current > 0 && answers.length !== seen.current) topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    seen.current = answers.length;
  }, [answers.length, reduce]);

  const choose = async (option: Option) => {
    if (busy || picked) return;
    setPicked(option.id);
    // Um instante para ver a escolha acontecer antes de a etapa seguir.
    if (!reduce) await new Promise((resolve) => setTimeout(resolve, 220));
    await journey.send(option.label, option.id);
    setPicked(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    setText("");
    if (!(await journey.send(content))) setText(content);
  };

  const pickProps = (o: Option, i: number) => ({ option: o, t, index: i, reduce, chosen: picked === o.id, dimmed: picked !== null && picked !== o.id, disabled: busy || picked !== null, onPick: () => void choose(o) });

  return (
    <section ref={topRef} aria-label="Conversa" className="mt-6 flex w-full scroll-mt-4 flex-col gap-4 text-left @4xl:mt-0">
      {status !== "failed" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--t-text)_12%,transparent)]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Andamento">
          <motion.span initial={false} animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} className="block h-full rounded-full [background:var(--t-cta)]" />
        </div>
      )}

      {answers.length > 0 && (
        <ol aria-label="Suas respostas" className="flex flex-wrap gap-1.5">
          {answers.map((a) => (
            <motion.li key={a.id} initial={reduce ? false : { opacity: 0, scale: 0.7, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={spring} className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[13px] font-medium ${t.card}`}>
              <Check size={13} className={`shrink-0 ${t.accent}`} />
              <span className="truncate">{textOf(a.message)}</span>
            </motion.li>
          ))}
        </ol>
      )}

      <div role="log" aria-live="polite" className="min-h-[120px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={stageKey} initial={reduce ? false : { opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -22 }} transition={{ type: "spring", stiffness: 440, damping: 34, mass: 0.7 }} className="flex flex-col gap-3">
            {status === "loading" && <TypingDots t={t} />}

            {finished && <Celebration t={t} burst={burst} reduce={reduce} />}

            {leads.map((m, i) => (
              <motion.p key={i} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.05 }} className={`whitespace-pre-wrap break-words ${finished && i === 0 ? "text-center font-display text-[22px] font-bold leading-tight tracking-tight" : `text-[15px] leading-snug ${finished ? `text-center ${t.muted}` : t.muted}`}`}>
                {textOf(m)}
              </motion.p>
            ))}

            {images.map((m) => (isImageUrl(m.url) ? <figure key={m.url} className={`overflow-hidden rounded-2xl border ${t.card}`}><img src={imageSrc(m.url)} alt={m.caption ?? ""} loading="lazy" className="max-h-72 w-full object-cover" />{m.caption && <figcaption className="px-4 py-2.5 text-[15px] leading-snug">{m.caption}</figcaption>}</figure> : null))}

            {headlineText && <Headline text={headlineText} reduce={reduce} />}

            {main.length > 0 && display === "cards" && <div className="grid grid-cols-1 gap-2.5 @2xl:grid-cols-2">{main.map((o, i) => <ServiceCard key={o.id} {...pickProps(o, i)} />)}</div>}
            {main.length > 0 && display === "dates" && <div className="grid grid-cols-3 gap-2 @lg:grid-cols-4">{main.map((o, i) => <DateTile key={o.id} {...pickProps(o, i)} />)}</div>}
            {main.length > 0 && display === "times" && <div className="grid grid-cols-3 gap-2 @lg:grid-cols-4">{main.map((o, i) => <TimeChip key={o.id} {...pickProps(o, i)} />)}</div>}
            {main.length > 0 && !display && (
              <div className="flex flex-col gap-2">
                {main.map((o, i) => (
                  <motion.button key={o.id} type="button" disabled={busy || picked !== null} onClick={() => void choose(o)} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: picked && picked !== o.id ? 0.35 : 1, y: 0, scale: picked === o.id ? 1.02 : 1 }} transition={{ ...spring, delay: reduce || picked ? 0 : 0.12 + i * 0.05 }} whileHover={reduce ? undefined : { x: 3 }} whileTap={reduce ? undefined : { scale: 0.97 }} className={`min-h-[52px] w-full px-4 py-2.5 text-center text-[16px] font-semibold ${optionClass}`}>
                    {o.label}
                  </motion.button>
                ))}
              </div>
            )}

            {secondary.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-4">
                {secondary.map((o) => (
                  <button key={o.id} type="button" disabled={busy || picked !== null} onClick={() => void choose(o)} className={`min-h-11 px-2 text-[14px] font-semibold underline underline-offset-4 ${t.muted}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            {links.map((m) =>
              m.url.startsWith("https://") || import.meta.env.DEV ? (
                <div key={m.url} className="flex flex-col gap-2">
                  {m.text && <p className={`text-center text-[14.5px] leading-snug ${t.muted}`}>{m.text}</p>}
                  <motion.a href={m.url} target="_blank" rel="noopener noreferrer" onClick={() => m.url.startsWith("https://wa.me/") && journey.tapWhatsapp()} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: reduce ? 0 : 0.3 }} whileHover={reduce ? undefined : { scale: 1.02 }} whileTap={reduce ? undefined : { scale: 0.97 }} className={`flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3 text-[16px] font-bold ${t.primary}`}>
                    {m.url.startsWith("https://wa.me/") && <WhatsApp size={20} className="shrink-0" />}
                    {m.label}
                  </motion.a>
                </div>
              ) : null,
            )}

            {busy && !picked && <TypingDots t={t} />}

            {status === "handoff" && <p className={`text-center text-[14px] ${t.muted}`}>A equipe vai continuar o seu atendimento.</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="text-[14px] font-semibold">
          {error}
        </p>
      )}

      {status === "waiting" && options.length === 0 && (
        <motion.form initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: reduce ? 0 : 0.2 }} onSubmit={(e) => void submit(e)} className={`flex min-h-14 items-center gap-1 rounded-2xl border pl-4 pr-1.5 focus-within:ring-2 focus-within:ring-[var(--t-accent)] ${t.card}`}>
          <input aria-label="Sua resposta" autoFocus={answers.length > 0} value={text} maxLength={2000} enterKeyHint="send" placeholder="Escreva aqui" onChange={(e) => setText(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-[16px] outline-none placeholder:opacity-60" />
          <motion.button type="submit" aria-label="Enviar" disabled={busy || !text.trim()} whileTap={reduce ? undefined : { scale: 0.9 }} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-opacity disabled:opacity-40 ${t.primary}`}>
            <Send size={18} />
          </motion.button>
        </motion.form>
      )}

      {(finished || status === "handoff") && (
        <button type="button" onClick={() => void journey.restart()} className={`flex min-h-11 items-center justify-center gap-2 text-[14px] font-semibold ${t.muted}`}>
          <RefreshCw size={15} />
          Começar de novo
        </button>
      )}

      {onViewLinks && (
        <button type="button" onClick={onViewLinks} className={`min-h-11 text-center text-[14px] font-semibold underline underline-offset-4 ${t.muted}`}>
          Ver todos os links
        </button>
      )}
    </section>
  );
}

function TypingDots({ t }: { t: Palette }) {
  const reduce = useReducedMotion();
  return (
    <span className={`inline-flex h-11 w-fit items-center gap-1.5 rounded-2xl border px-4 ${t.card}`} role="status" aria-label="Escrevendo">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={reduce ? undefined : { y: [0, -5, 0], opacity: [0.45, 1, 0.45] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14 }} className="h-2 w-2 rounded-full bg-[var(--t-text)]" />
      ))}
    </span>
  );
}
