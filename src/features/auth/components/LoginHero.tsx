import { CalendarCheck, Globe, type LucideIcon, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { type MouseEvent, useEffect, useState } from "react";
import { Logo } from "../../../shared/components/ui/Logo";

interface LiveEvent {
  icon: LucideIcon;
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

  // Parallax suave das luzes acompanhando o mouse.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const orbAx = useTransform(sx, (v) => v * 60);
  const orbAy = useTransform(sy, (v) => v * 60);
  const orbBx = useTransform(sx, (v) => v * -80);
  const orbBy = useTransform(sy, (v) => v * -80);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const loop = (duration: number) => (reduce ? undefined : { duration, repeat: Infinity, ease: "easeInOut" as const });

  return (
    <section
      onMouseMove={onMove}
      aria-label="Apresentação do Nexo"
      className="relative hidden flex-[1.15] flex-col justify-between overflow-hidden bg-[#EEF2FF] p-14 lg:flex dark:bg-[#0B0F24]"
    >
      <motion.div style={{ x: orbAx, y: orbAy }} className="pointer-events-none absolute -left-32 -top-36">
        <motion.div
          animate={reduce ? undefined : { x: [0, 80, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
          transition={loop(16)}
          className="h-[560px] w-[560px] rounded-full bg-[#3D8BFF] opacity-50 blur-[90px] dark:bg-[#1F5BFF]"
        />
      </motion.div>
      <motion.div style={{ x: orbBx, y: orbBy }} className="pointer-events-none absolute -bottom-40 -right-40">
        <motion.div
          animate={reduce ? undefined : { x: [0, -70, 0], y: [0, -50, 0], scale: [1.1, 0.95, 1.1] }}
          transition={loop(19)}
          className="h-[540px] w-[540px] rounded-full bg-[#9B7BFF] opacity-50 blur-[90px] dark:bg-[#7C3AED]"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
        <Logo size={44} />
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
              className="flex w-[340px] items-center gap-3.5 rounded-[22px] border border-white/80 bg-white/70 p-4 shadow-[0_20px_50px_rgb(11_18_32/0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-white ${
                  ev.tone === "primary" ? "bg-[#0A6CFF]" : "bg-[#7C5CFF]"
                }`}
              >
                <ev.icon size={20} />
              </span>
              <span className="flex flex-col">
                <span className="text-[15px] font-bold text-[#0B1220] dark:text-white">{ev.title}</span>
                <span className="text-[13px] text-[#3B4558] dark:text-[#C9CFDA]">{ev.detail}</span>
              </span>
              <span className="ml-auto text-[12px] font-medium text-[#3B4558]/70 dark:text-white/50">agora</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative flex max-w-xl flex-col gap-4">
        <h1 className="text-[52px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0B1220] dark:text-white">
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
          className="text-[18px] leading-relaxed text-[#3B4558] dark:text-[#C9CFDA]"
        >
          Bots com IA no WhatsApp e no Instagram, páginas que vendem e todos os seus contatos juntos.
        </motion.p>
      </div>
    </section>
  );
}
