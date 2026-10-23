import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "success" | "warning" | "danger" | "primary" | "accent" | "neutral";

const TONES: Record<Tone, string> = {
  success: "bg-success/14 text-success-strong",
  warning: "bg-warning/16 text-warning-strong",
  danger: "bg-danger/14 text-danger-strong",
  primary: "bg-primary/12 text-primary-strong",
  accent: "bg-accent/14 text-accent-strong",
  neutral: "bg-text-secondary/12 text-text-secondary",
};

export function Badge({ tone = "neutral", icon: Icon, children }: { tone?: Tone; icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONES[tone]}`}>
      {Icon && <Icon size={13} strokeWidth={2.4} />}
      {children}
    </span>
  );
}
