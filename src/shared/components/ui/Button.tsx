import { Loader2, type LucideIcon } from "lucide-react";
import { type HTMLMotionProps, motion } from "motion/react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--nx-primary)_35%,transparent)] hover:brightness-110",
  secondary: "bg-primary/12 text-primary-strong hover:bg-primary/18",
  outline: "border border-border-ui bg-panel text-text-primary hover:bg-panel-hover",
  ghost: "text-text-primary hover:bg-panel-hover",
  danger: "bg-danger/12 text-danger-strong hover:bg-danger/18",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-[10px]",
  md: "h-10 px-4 text-[14px] gap-2 rounded-xl",
  lg: "h-12 px-5 text-[16px] gap-2 rounded-2xl",
};

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  children?: ReactNode;
}

/** Botão padrão do Nexo: leve "aperto" ao tocar, como no iOS. */
export function Button({ variant = "primary", size = "md", icon: Icon, loading, children, className = "", disabled, ...rest }: ButtonProps) {
  const iconSize = size === "lg" ? 18 : size === "sm" ? 14 : 16;
  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={`inline-flex shrink-0 items-center justify-center font-semibold transition-[background-color,filter,opacity] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={iconSize} className="animate-spin" /> : Icon && <Icon size={iconSize} strokeWidth={2.2} />}
      {children}
    </motion.button>
  );
}

interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: LucideIcon;
  label: string;
  variant?: "outline" | "ghost";
  size?: number;
}

export function IconButton({ icon: Icon, label, variant = "ghost", size = 40, className = "", ...rest }: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl text-text-primary transition-colors ${
        variant === "outline" ? "border border-border-ui bg-panel hover:bg-panel-hover" : "hover:bg-panel-hover"
      } ${className}`}
      {...rest}
    >
      <Icon size={Math.round(size / 2)} strokeWidth={2} />
    </motion.button>
  );
}
