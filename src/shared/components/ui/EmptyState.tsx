import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex max-w-sm flex-col items-center gap-4 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
          <Icon size={30} strokeWidth={1.8} />
        </span>
        <div className="flex flex-col gap-1.5">
          <p className="text-xl font-bold tracking-tight text-text-primary">{title}</p>
          {description && <p className="text-[15px] leading-relaxed text-text-secondary">{description}</p>}
        </div>
        {children}
      </motion.div>
    </div>
  );
}
