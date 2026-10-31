import { Monitor, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useThemeStore } from "../../../features/theme/theme-store";
import { Segmented } from "./Segmented";

/** Botão de alternar claro/escuro, com o ícone girando na troca. */
/** glass: versão de vidro, para ficar sobre o fundo vivo (topo do login no celular). */
export function ThemeToggleButton({ className = "", glass = false }: { className?: string; glass?: boolean }) {
  const { resolved, toggle } = useThemeStore();
  const dark = resolved === "dark";
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      className={`inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border ${glass ? "border-white/25 bg-white/15 text-white backdrop-blur-md" : "border-border-ui bg-panel text-text-primary shadow-card"} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={resolved}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.22 }}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/** Escolha completa (Sistema / Claro / Escuro) para o menu de ajustes. */
export function ThemeSegmented() {
  const { preference, setPreference } = useThemeStore();
  return (
    <Segmented
      label="Tema"
      size="sm"
      fullWidth
      value={preference}
      onChange={setPreference}
      options={[
        { value: "system", label: "Auto", icon: Monitor },
        { value: "light", label: "Claro", icon: Sun },
        { value: "dark", label: "Escuro", icon: Moon },
      ]}
    />
  );
}
