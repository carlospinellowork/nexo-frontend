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
    <div role="radiogroup" aria-label={label} className={`flex rounded-xl bg-text-secondary/12 p-[3px] ${fullWidth ? "w-full" : "w-fit"}`}>
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
            className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] font-semibold transition-colors ${
              size === "sm" ? "h-8 px-2 text-[13px]" : "h-9 px-4 text-[14px]"
            } ${active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-[9px] bg-panel shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon size={15} strokeWidth={2.2} />}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
