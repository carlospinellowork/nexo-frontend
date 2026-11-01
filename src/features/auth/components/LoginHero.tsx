import { CalendarCheck, Globe, type IconComponent, MessageCircle, Sparkles, UserPlus } from "../../../shared/icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "../../../shared/components/ui/Logo";
import { MeshBackground } from "./MeshBackground";

interface LiveEvent {
  icon: IconComponent;
  title: string;
  detail: string;
  tone: "primary" | "accent";
}

// O que o Nexo faz, mostrado como notificações ao vivo.
const EVENTS: LiveEvent[] = [
  { icon: CalendarCheck, title: "Consulta agendada", detail: "pelo bot no WhatsApp", tone: "primary" },
  { icon: Globe, title: "Página publicada", detail: "criada conversando com a IA", tone: "accent" },
  { icon: UserPlus, title: "Novo contato", detail: "vindo do Instagram Direct", tone: "primary" },
  { icon: Sparkles, title: "Dúvida respondida", detail: "pelo agente de IA, às 23h", tone: "accent" },
  { icon: MessageCircle, title: "Atendimento transferido", detail: "para a recepção, sem fila", tone: "primary" },
];

const HEADLINE = "Sua empresa no digital, num lugar só.".split(" ");
const VISIBLE = 3;

export function LoginHero() {
  const reduce = useReducedMotion();
  const [start, setStart] = useState(0);

  // A cada 2,6s entra uma notificação nova no topo e a mais antiga sai.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStart((s) => (s + 1) % EVENTS.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  const visible = Array.from({ length: VISIBLE }, (_, i) => {
    const index = (start + i) % EVENTS.length;
    return { ...EVENTS[index], key: `${index}-${Math.floor((start + i) / EVENTS.length)}` };
  });

  return (
    <section aria-label="Apresentação do Nexo" className="relative hidden flex-[1.15] flex-col justify-between overflow-hidden p-12 text-white lg:flex">
      <MeshBackground />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
        <Logo size={40} tone="light" />
      </motion.div>

      <div className="relative flex h-[300px] flex-col gap-3" aria-live="off">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((ev, i) => (
            <motion.div
              key={ev.key}
              layout
              initial={{ opacity: 0, y: -28, scale: 0.92 }}
              animate={{ opacity: 1 - i * 0.22, y: 0, scale: 1 - i * 0.03 }}
              exit={{ opacity: 0, y: 24, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              style={{ marginLeft: i * 28 }}
              className="flex w-[340px] items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-[0_20px_50px_rgb(8_4_30/0.35)] backdrop-blur-xl backdrop-saturate-150"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  ev.tone === "primary" ? "bg-[#6D4AFF] text-white" : "bg-[#FFC400] text-[#1A1400]"
                }`}
              >
                <ev.icon size={20} />
              </span>
              <span className="flex flex-col">
                <span className="text-[14px] font-bold text-white">{ev.title}</span>
                <span className="text-[12.5px] text-white/75">{ev.detail}</span>
              </span>
              <span className="ml-auto text-[11.5px] font-medium text-white/55">agora</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative flex max-w-xl flex-col gap-4">
        <h1 className="text-[50px] font-extrabold leading-[1.04] tracking-[-0.03em] text-white">
          {HEADLINE.map((word, i) => (
            <motion.span
              key={word + i}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="mr-[0.25em] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-[17px] leading-relaxed text-white/80"
        >
          Bots com IA no WhatsApp e no Instagram, páginas que vendem e todos os seus contatos juntos.
        </motion.p>
      </div>
    </section>
  );
}
