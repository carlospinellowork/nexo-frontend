import { Loader2, type LucideIcon } from "lucide-react";
import { type HTMLMotionProps, motion } from "motion/react";
import type { ReactNode } from "react";
import { type Gesture, gestureFor } from "./gestures";

/**
 * primary: ação principal da tela (roxo com o fio amarelo do Nexo).
 * gold: ação de crescimento (publicar, compartilhar). Uma por tela, no máximo.
 * secondary: ação de apoio, suave. outline / ghost: neutras. danger: destrutiva.
 */
type Variant = "primary" | "gold" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "nx-btn-primary",
  gold: "nx-btn-gold hover:brightness-105",
  secondary: "bg-primary/12 text-primary-strong hover:bg-primary/20",
  outline: "border border-border-ui bg-panel text-text-primary hover:bg-panel-hover",
  ghost: "text-text-primary hover:bg-panel-hover",
  danger: "bg-danger/12 text-danger-strong hover:bg-danger/20",
};

// Mais justos que antes: 32 / 36 / 44 px. O lg (44) é o tamanho de toque do celular.
const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-[9px]",
  md: "h-9 px-3.5 text-[13.5px] gap-1.5 rounded-[11px]",
  lg: "h-11 px-4 text-[15px] gap-2 rounded-xl",
};

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  /** Gesto do ícone no hover. Sem ele, usa o gesto padrão daquele ícone (gestures.ts). */
  gesture?: Gesture;
  loading?: boolean;
  children?: ReactNode;
}

/** Botão padrão do Nexo: aperto com mola ao tocar e ícone que faz o seu gesto no hover. */
export function Button({ variant = "primary", size = "md", icon: Icon, gesture, loading, children, className = "", disabled, ...rest }: ButtonProps) {
  const iconSize = size === "lg" ? 18 : size === "sm" ? 14 : 16;
  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      disabled={disabled || loading}
      className={`nx-anim inline-flex shrink-0 items-center justify-center font-semibold tracking-[-0.005em] transition-[background-color,filter,opacity,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        Icon && <Icon size={iconSize} strokeWidth={2.2} data-gesture={gesture ?? gestureFor(Icon)} />
      )}
      {children}
    </motion.button>
  );
}

interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: LucideIcon;
  label: string;
  variant?: "outline" | "ghost";
  size?: number;
  gesture?: Gesture;
}

export function IconButton({ icon: Icon, label, variant = "ghost", size = 36, gesture, className = "", ...rest }: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={`nx-anim inline-flex shrink-0 items-center justify-center rounded-[10px] text-text-primary transition-colors ${
        variant === "outline" ? "border border-border-ui bg-panel hover:bg-panel-hover" : "hover:bg-panel-hover"
      } ${className}`}
      {...rest}
    >
      <Icon size={Math.round(size / 2)} strokeWidth={2} data-gesture={gesture ?? gestureFor(Icon)} />
    </motion.button>
  );
}
