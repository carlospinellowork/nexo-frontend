import { ArrowUp, Headset, MessageCircle, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { OutboundMessage } from "../../../api/mutations/useSimulator";
import type { ChatSettings } from "../../chatBuilder/store/chat-builder-store";
import type { ChatLine } from "../hooks/useSimulatorSession";

interface SimulationChatProps {
  lines: ChatLine[];
  settings: ChatSettings;
  canSend: boolean;
  busy: boolean;
  onSend: (text: string, optionId?: string) => void;
  onRestart: () => void;
  /** Versão menor, sem a moldura do iPhone (painel de teste do editor). */
  compact?: boolean;
}

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md px-3.5 py-3" style={{ backgroundColor: color }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-current opacity-50"
          animate={{ y: [0, -4, 0], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

const BUBBLE = "whitespace-pre-wrap break-words rounded-[20px] rounded-bl-md px-3.5 py-2.5 text-[15px] leading-snug";

function BotContent({
  message,
  settings,
  interactive,
  onPick,
}: {
  message: OutboundMessage;
  settings: ChatSettings;
  interactive: boolean;
  onPick: (label: string, id: string) => void;
}) {
  const bubble = { backgroundColor: settings.botBubbleColor, color: settings.botTextColor };

  if (message.type === "image") {
    return (
      <div className="max-w-[80%] overflow-hidden rounded-[20px] rounded-bl-md" style={bubble}>
        <img src={message.url} alt={message.caption ?? "Imagem"} className="max-h-56 w-full object-cover" />
        {message.caption && <p className="px-3.5 py-2 text-[14px] leading-snug">{message.caption}</p>}
      </div>
    );
  }
  if (message.type === "link") {
    return (
      <div className="flex max-w-[85%] flex-col gap-1.5">
        {message.text && (
          <div className={BUBBLE} style={bubble}>
            {message.text}
          </div>
        )}
        <a
          href={message.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#25D366] px-4 py-2.5 text-[14px] font-bold text-white shadow-[0_6px_16px_rgb(37_211_102/0.35)]"
        >
          <MessageCircle size={16} />
          {message.label}
        </a>
      </div>
    );
  }
  if (message.type === "buttons") {
    return (
      <div className="flex max-w-[85%] flex-col gap-1.5">
        <div className={BUBBLE} style={bubble}>
          {message.text}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {message.options.map((o) => (
            <motion.button
              key={o.id}
              whileTap={interactive ? { scale: 0.95 } : undefined}
              disabled={!interactive}
              onClick={() => onPick(o.label, o.id)}
              className="rounded-full border-[1.5px] bg-white px-3.5 py-1.5 text-[14px] font-semibold transition-opacity disabled:opacity-50"
              style={{ borderColor: settings.mainColor, color: settings.mainColor }}
            >
              {o.label}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={`max-w-[80%] ${BUBBLE}`} style={bubble}>
      {message.text}
    </div>
  );
}

// A conversa imita o widget do cliente, que é sempre claro; por isso as cores fixas aqui.
const SYSTEM_TONES = {
  info: "bg-black/5 text-[#4A5468]",
  warning: "bg-[#FFB020]/18 text-[#8A5A00]",
  danger: "bg-[#FF3B30]/12 text-[#B42318]",
};

/** Conversa de teste com as cores configuradas na Aparência. */
export function SimulationChat({ lines, settings, canSend, busy, onSend, onRestart, compact }: SimulationChatProps) {
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastBotIndex = lines.reduce((last, l, i) => (l.from === "bot" ? i : last), -1);
  const handoff = lines.some((l) => l.from === "system" && l.tone === "warning");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, busy]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !canSend) return;
    onSend(value.trim());
    setValue("");
  };

  const screen = (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F7F8FA] ${compact ? "rounded-[22px]" : "rounded-[38px]"}`}>
      <div
        className={`flex items-center gap-3 px-5 pb-3 ${compact ? "pt-3" : "pt-5"}`}
        style={{ backgroundColor: settings.headerBackgroundColor, color: settings.headerTextColor }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-[13px] font-bold">{settings.botName.slice(0, 2).toUpperCase()}</span>
        <div className="flex flex-1 flex-col">
          <span className="text-[15px] font-semibold">{settings.botName}</span>
          <span className="text-[12px] opacity-80">{busy ? "digitando..." : handoff ? "com um atendente" : "online"}</span>
        </div>
        <motion.button whileTap={{ rotate: -180 }} onClick={onRestart} className="rounded-full p-2 hover:bg-white/15" title="Reiniciar conversa" aria-label="Reiniciar conversa">
          <RotateCcw size={16} />
        </motion.button>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {lines.map((line, index) =>
            line.from === "system" ? (
              <motion.div
                key={line.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mx-auto my-1 flex items-center gap-1.5 rounded-full px-3 py-1 text-center text-[12px] font-medium ${SYSTEM_TONES[line.tone ?? "info"]}`}
              >
                {line.tone === "warning" && <Headset size={13} />}
                {line.text}
              </motion.div>
            ) : (
              <motion.div
                key={line.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{ originX: line.from === "user" ? 1 : 0 }}
                className={`flex ${line.from === "user" ? "justify-end" : "justify-start"}`}
              >
                {line.from === "user" ? (
                  <div
                    className="max-w-[80%] whitespace-pre-wrap break-words rounded-[20px] rounded-br-md px-3.5 py-2.5 text-[15px] leading-snug"
                    style={{ backgroundColor: settings.userBubbleColor, color: "#fff" }}
                  >
                    {line.message.type === "text" ? line.message.text : ""}
                  </div>
                ) : (
                  <BotContent
                    message={line.message}
                    settings={settings}
                    interactive={canSend && !busy && index === lastBotIndex}
                    onPick={(label, id) => onSend(label, id)}
                  />
                )}
              </motion.div>
            ),
          )}
        </AnimatePresence>
        {busy && <TypingDots color={settings.botBubbleColor} />}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-black/5 bg-white px-3 py-3">
        <input
          disabled={!canSend || busy}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={canSend ? "Responda como cliente..." : handoff ? "Com um atendente" : "Conversa encerrada"}
          aria-label="Mensagem de teste"
          className="h-10 min-w-0 flex-1 rounded-full border border-black/10 bg-[#F2F4F8] px-4 text-[15px] text-[#0B1220] outline-none placeholder:text-[#4A5468]/70 focus:border-black/20 disabled:opacity-60"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!canSend || busy || !value.trim()}
          style={{ backgroundColor: settings.mainColor }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          <ArrowUp size={18} strokeWidth={2.6} />
        </motion.button>
      </form>
    </div>
  );

  if (compact) return <div className="flex h-full min-h-0 flex-col">{screen}</div>;
  return <div className="mx-auto flex h-full max-h-[760px] w-full max-w-[400px] flex-col rounded-[48px] bg-[#0B1220] p-3 shadow-[0_30px_80px_rgb(11_18_32/0.35)]">{screen}</div>;
}
