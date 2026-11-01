import { BatteryFull, Signal, Wifi } from "../../icons";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  /** md: prévia principal (editor da Bio, páginas, simulador). sm: prévia pequena (assistente da Bio). */
  size?: "sm" | "md";
  /** Cor do relógio e dos ícones da barra de status, conforme o fundo do topo da tela. */
  statusTone?: "dark" | "light";
  /** O conteúdo rola dentro da tela (padrão). Desligue quando o filho controla a própria rolagem (chat). */
  scroll?: boolean;
  /**
   * Cor da faixa da barra de status (o fundo do topo da página). Com ela, o conteúdo começa abaixo da barra,
   * como num celular de verdade. Sem ela, o conteúdo passa por baixo da barra (ex.: o cabeçalho colorido do chat).
   */
  statusBg?: string;
  /** Bloqueia toques na tela (prévias que são só para ver). */
  inert?: boolean;
  className?: string;
  /** Sobreposto à tela, fora da área que rola (ex.: o botão flutuante do chat). */
  overlay?: ReactNode;
  label?: string;
}

const SIZES = {
  sm: { frame: "h-[440px] w-full max-w-[260px] rounded-[38px] p-[7px]", screen: "rounded-[31px]", island: "top-[13px] h-[18px] w-[70px]", status: "h-9 px-6 text-[11px]", icon: 11 },
  md: {
    frame: "h-full max-h-[800px] w-full max-w-[380px] rounded-[44px] p-[8px] md:rounded-[54px] md:p-[11px]",
    screen: "rounded-[36px] md:rounded-[43px]",
    island: "top-[15px] h-[22px] w-[84px] md:top-[19px] md:h-[26px] md:w-[96px]",
    status: "h-11 px-7 text-[12px] md:h-[52px] md:px-8 md:text-[13px]",
    icon: 13,
  },
} as const;

/**
 * O celular padrão do Nexo para todas as prévias (Bio, landing pages, bot). Moldura de titânio escuro,
 * ilha no topo, barra de status e botões laterais. A tela é o filho; a barra de status fica por cima,
 * como num iPhone, então o conteúdo pode passar por baixo dela.
 */
export function PhoneFrame({ children, size = "md", statusTone = "dark", statusBg, scroll = true, inert, className = "", overlay, label = "Prévia no celular" }: PhoneFrameProps) {
  const s = SIZES[size];
  const statusColor = statusTone === "light" ? "text-white" : "text-[#0b0a14]";
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      role="group"
      aria-label={label}
      className={`relative mx-auto flex shrink-0 flex-col bg-gradient-to-b from-[#2a2838] via-[#16141f] to-[#2a2838] shadow-[0_0_0_1px_rgb(255_255_255/0.08)_inset,0_30px_70px_-20px_rgb(11_8_30/0.55),0_0_0_1px_rgb(0_0_0/0.6)] ${s.frame} ${className}`}
    >
      {/* Botões laterais. */}
      <span aria-hidden className="absolute -left-[3px] top-[18%] h-8 w-[3px] rounded-l bg-[#2a2838]" />
      <span aria-hidden className="absolute -left-[3px] top-[27%] h-12 w-[3px] rounded-l bg-[#2a2838]" />
      <span aria-hidden className="absolute -right-[3px] top-[24%] h-16 w-[3px] rounded-r bg-[#2a2838]" />

      <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white ${s.screen}`}>
        {/* Barra de status: numa faixa própria (statusBg) ou por cima do conteúdo. */}
        <div
          aria-hidden
          style={statusBg ? { background: statusBg } : undefined}
          className={`pointer-events-none z-20 flex shrink-0 items-center justify-between font-semibold ${statusBg ? "relative" : "absolute inset-x-0 top-0"} ${s.status} ${statusColor}`}
        >
          <span className="tabular-nums">9:41</span>
          <span className="flex items-center gap-1">
            <Signal size={s.icon} strokeWidth={2.6} />
            <Wifi size={s.icon} strokeWidth={2.6} />
            <BatteryFull size={s.icon + 3} strokeWidth={2.2} />
          </span>
        </div>
        <div className={`nx-phone-scroll min-h-0 flex-1 ${scroll ? "overflow-y-auto" : "flex flex-col overflow-hidden"} ${inert ? "pointer-events-none" : ""}`}>{children}</div>
        <span aria-hidden className={`pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-full bg-black ${s.island}`} />
        {overlay}
      </div>
    </motion.div>
  );
}
