import { motion, useReducedMotion } from "motion/react";
import { imageSrc, isImageUrl } from "../../uploads/image";

/** A entrada da conversa: a marca da loja aparece primeiro, nas cores dela, enquanto o atendimento abre. */
export function BioSplash({ name, initials, imageUrl }: { name: string; initials: string; imageUrl?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 1.04 }} transition={{ duration: 0.28 }} role="status" aria-label={`Abrindo ${name}`} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[var(--t-page)] px-6 text-center text-[var(--t-text)]">
      <motion.span initial={reduce ? false : { scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="relative flex h-32 w-32 items-center justify-center">
        {!reduce && <motion.span animate={{ scale: [1, 1.35], opacity: [0.35, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 rounded-full bg-[var(--t-accent)]" />}
        <motion.span animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 1.3, ease: "linear", repeat: Infinity }} className="absolute inset-0 rounded-full [background:conic-gradient(from_0deg,transparent_10%,var(--t-accent))]" />
        <span className="absolute inset-[4px] rounded-full bg-[var(--t-page)]" />
        <span className="relative flex h-[108px] w-[108px] items-center justify-center overflow-hidden rounded-full text-[38px] font-extrabold [background:var(--t-cta)] text-[var(--t-cta-text)]">{isImageUrl(imageUrl) ? <img src={imageSrc(imageUrl)} alt="" className="h-full w-full object-cover" /> : initials}</span>
      </motion.span>
      <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }} className="flex flex-col items-center gap-1">
        <span className="font-display text-[22px] font-bold leading-tight tracking-tight">{name}</span>
        <span className="text-[14px] text-[var(--t-muted)]">Preparando o seu atendimento</span>
      </motion.div>
      <span className="h-1 w-40 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--t-text)_14%,transparent)]">
        <motion.span animate={reduce ? undefined : { x: ["-100%", "260%"] }} transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }} className="block h-full w-2/5 rounded-full [background:var(--t-cta)]" />
      </span>
    </motion.div>
  );
}
