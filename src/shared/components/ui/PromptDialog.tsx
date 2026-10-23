import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { inputClass } from "./styles";

interface PromptDialogProps {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

/** Substitui window.prompt(): pede um texto curto (ex.: nome de chat ou workspace). */
export function PromptDialog({ open, title, label, placeholder, confirmLabel = "Criar", loading, onConfirm, onClose }: PromptDialogProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onConfirm(value.trim());
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        >
          <motion.form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="w-full max-w-md rounded-3xl bg-panel p-6 shadow-float"
          >
            <h2 id="prompt-title" className="mb-5 text-xl font-bold tracking-tight text-text-primary">
              {title}
            </h2>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
              <input
                ref={inputRef}
                value={value}
                maxLength={80}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!value.trim()} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
