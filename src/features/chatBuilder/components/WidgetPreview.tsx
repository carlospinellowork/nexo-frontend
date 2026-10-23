import { ArrowUp, Mail, MessageCircle, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useChatBuilderStore } from "../store/chat-builder-store";

const RADIUS = { none: "10px", medium: "20px", full: "9999px" } as const;
const ICONS = { default: MessageCircle, sparkles: Sparkles, message: Mail } as const;

/** Prévia fiel ao widget real (nexo-backend/src/public/nexo-chat.js). Clique no botão para abrir/fechar. */
export function WidgetPreview() {
  const s = useChatBuilderStore((st) => st.draft);
  const [open, setOpen] = useState(true);
  const Icon = ICONS[s.buttonIcon] ?? MessageCircle;
  const side = s.position === "left" ? "left-8 items-start" : "right-8 items-end";

  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(var(--nx-dots)_1.2px,transparent_1.2px)] [background-size:22px_22px]">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary/40">
        <span className="text-[44px] font-extrabold tracking-tight">Site do seu cliente</span>
        <span className="text-[15px] font-medium">Prévia ao vivo do botão de atendimento</span>
      </div>

      <div className={`absolute bottom-8 flex w-[340px] flex-col gap-4 ${side}`}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{ borderRadius: s.borderRadius === "none" ? 10 : 22, originY: 1 }}
              className="w-full overflow-hidden bg-white shadow-[0_24px_60px_rgb(11_18_32/0.22)]"
            >
              <div className="flex items-center gap-3 p-4" style={{ backgroundColor: s.headerBackgroundColor, color: s.headerTextColor }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-[13px] font-bold">{s.botName.slice(0, 2).toUpperCase()}</span>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold">{s.botName}</span>
                  <span className="text-[12px] opacity-80">Online agora</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#FAFAFA] p-4">
                <div className="max-w-[85%] rounded-[18px] rounded-bl-md px-3.5 py-2.5 text-[14px]" style={{ backgroundColor: s.botBubbleColor, color: s.botTextColor }}>
                  Olá! Qual é o seu nome?
                </div>
                <div className="ml-auto max-w-[85%] rounded-[18px] rounded-br-md px-3.5 py-2.5 text-[14px] text-white" style={{ backgroundColor: s.userBubbleColor }}>
                  Maria
                </div>
              </div>
              <div className="flex gap-2 border-t border-black/5 p-3">
                <div className="flex h-10 flex-1 items-center rounded-full border border-black/10 px-4 text-[13px] text-[#4A5468]/70">Digite sua mensagem...</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: s.mainColor }}>
                  <ArrowUp size={18} strokeWidth={2.6} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar prévia do chat" : "Abrir prévia do chat"}
          className="flex h-16 w-16 items-center justify-center text-white shadow-[0_12px_30px_rgb(11_18_32/0.28)]"
          style={{ backgroundColor: s.mainColor, borderRadius: RADIUS[s.borderRadius] }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? "x" : "icon"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              {open ? <X size={26} /> : <Icon size={28} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
