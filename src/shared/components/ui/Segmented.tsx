import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useId } from "react";

interface SegmentedProps<T extends string> {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

/** Controle segmentado do iOS, com o indicador deslizando entre as opções. */
export function Segmented<T extends string>({ options, value, onChange, label, size = "md", fullWidth }: SegmentedProps<T>) {
  const layoutId = useId();
  return (
    <div role="radiogroup" aria-label={label} className={`flex rounded-[11px] bg-text-secondary/12 p-[3px] ${fullWidth ? "w-full" : "w-fit"}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] font-semibold transition-colors ${fullWidth ? "min-w-0" : "shrink-0"} ${
              size === "sm" ? "h-7 px-1.5 text-[12px]" : "h-8 px-3 text-[13.5px]"
            } ${active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-[8px] bg-panel shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
              />
            )}
            <span className="relative flex min-w-0 items-center gap-1">
              {Icon && <Icon size={size === "sm" ? 13 : 15} strokeWidth={2.2} className="shrink-0" />}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
