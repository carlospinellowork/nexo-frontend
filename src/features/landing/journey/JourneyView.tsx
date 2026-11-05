import { motion, useReducedMotion } from "motion/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Send, WhatsApp } from "../../../shared/icons";
import { imageSrc, isImageUrl } from "../../uploads/image";
import type { Palette } from "../look/resolve";
import type { Journey, JourneyEntry } from "./useJourney";

function Message({ entry, t, onLink }: { entry: JourneyEntry; t: Palette; onLink: (url: string) => void }) {
  const { message: m, from } = entry;
  const bubble = (text: string) => (
    <p className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl border px-4 py-2.5 text-left text-[15px] leading-snug ${from === "user" ? `self-end rounded-br-md ${t.primary}` : `self-start rounded-bl-md ${t.card}`}`}>{text}</p>
  );
  if (m.type === "image") {
    if (!isImageUrl(m.url)) return m.caption ? bubble(m.caption) : null;
    return (
      <figure className={`max-w-[85%] self-start overflow-hidden rounded-2xl border text-left ${t.card}`}>
        <img src={imageSrc(m.url)} alt={m.caption ?? ""} loading="lazy" className="max-h-64 w-full object-cover" />
        {m.caption && <figcaption className="px-4 py-2.5 text-[15px] leading-snug">{m.caption}</figcaption>}
      </figure>
    );
  }
  if (m.type === "link") {
    return (
      <>
        {m.text && bubble(m.text)}
        {(m.url.startsWith("https://") || import.meta.env.DEV) && (
          <a href={m.url} target="_blank" rel="noopener noreferrer" onClick={() => onLink(m.url)} className={`flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3 text-[16px] font-bold transition-transform active:scale-[0.98] ${t.primary}`}>
            {m.url.startsWith("https://wa.me/") && <WhatsApp size={20} className="shrink-0" />}
            {m.label}
          </a>
        )}
      </>
    );
  }
  return bubble(m.text);
}

/** A bio como conversa: o bot conduz e o visitante responde na própria página. */
export function JourneyView({ journey, t, optionClass, onViewLinks }: { journey: Journey; t: Palette; optionClass: string; onViewLinks?: () => void }) {
  const { entries, status, busy, error } = journey;
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const seen = useRef(0);

  // Acompanha as mensagens novas, sem tirar o perfil da tela quando a conversa abre.
  useEffect(() => {
    if (seen.current > 0 && entries.length > seen.current) endRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    seen.current = entries.length;
  }, [entries.length, busy, reduceMotion]);

  const last = entries.at(-1);
  const options = status === "waiting" && !busy && last?.from === "bot" && last.message.type === "buttons" ? last.message.options : [];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    setText("");
    if (!(await journey.send(content))) setText(content);
  };

  return (
    <section aria-label="Conversa" className="mt-6 flex w-full flex-col gap-2.5">
      <div role="log" aria-live="polite" className="flex flex-col gap-2.5">
        {entries.map((entry) => (
          <motion.div key={entry.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="flex flex-col gap-2.5">
            <Message entry={entry} t={t} onLink={(url) => url.startsWith("https://wa.me/") && journey.tapWhatsapp()} />
          </motion.div>
        ))}
        {(status === "loading" || busy) && (
          <span className={`flex h-11 w-16 items-center justify-center self-start rounded-2xl rounded-bl-md border ${t.card}`} role="status" aria-label="Escrevendo">
            <Loader2 size={18} className="animate-spin" />
          </span>
        )}
      </div>

      {options.length > 0 && (
        <div className="mt-1 flex flex-col gap-2">
          {options.map((o) => (
            <button key={o.id} type="button" onClick={() => void journey.send(o.label, o.id)} className={`min-h-12 w-full px-4 py-2.5 text-[15px] font-semibold transition-transform active:scale-[0.98] ${optionClass}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[14px] font-semibold">
          {error}
        </p>
      )}

      {status === "waiting" && (
        <form onSubmit={(e) => void submit(e)} className={`mt-1 flex min-h-12 items-center gap-1 rounded-2xl border pl-4 pr-1 ${t.card}`}>
          <input aria-label="Sua resposta" value={text} maxLength={2000} enterKeyHint="send" placeholder="Escreva aqui" onChange={(e) => setText(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-[16px] outline-none placeholder:opacity-60" />
          <button type="submit" aria-label="Enviar" disabled={busy || !text.trim()} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-opacity disabled:opacity-40 ${t.primary}`}>
            <Send size={18} />
          </button>
        </form>
      )}

      {status === "handoff" && <p className={`mt-1 text-[14px] ${t.muted}`}>A equipe vai continuar o seu atendimento.</p>}

      {(status === "completed" || status === "handoff") && (
        <button type="button" onClick={() => void journey.restart()} className={`mt-1 flex min-h-11 items-center justify-center gap-2 text-[14px] font-semibold ${t.muted}`}>
          <RefreshCw size={15} />
          Começar de novo
        </button>
      )}

      <div ref={endRef} />

      {onViewLinks && (
        <button type="button" onClick={onViewLinks} className={`mt-2 min-h-11 text-[14px] font-semibold underline underline-offset-4 ${t.muted}`}>
          Ver todos os links
        </button>
      )}
    </section>
  );
}
