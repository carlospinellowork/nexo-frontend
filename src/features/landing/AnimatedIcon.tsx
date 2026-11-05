import { motion, useReducedMotion } from "motion/react";
import type { IconComponent } from "../../shared/icons";
import { ICON_LOOPS, type IconMotion } from "./iconMotion";

/** Ícone fixo ou animado, como o dono escolheu. Quem pede menos movimento no aparelho vê sempre fixo. */
export function AnimatedIcon({ icon: Icon, motion: name, size = 20, className = "", delay = 0 }: { icon: IconComponent; motion?: string | null; size?: number; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const loop = name ? ICON_LOOPS[name as IconMotion] : undefined;
  if (!loop || reduce) return <Icon size={size} className={className} />;
  return (
    <motion.span animate={loop.animate} transition={{ duration: loop.duration, ease: loop.ease, repeat: Infinity, repeatDelay: loop.repeatDelay, delay }} className="inline-flex">
      <Icon size={size} className={className} />
    </motion.span>
  );
}
