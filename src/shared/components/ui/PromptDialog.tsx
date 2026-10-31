import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Sheet } from "./Sheet";
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
    <Sheet
      open={open}
      title={title}
      onClose={onClose}
      onSubmit={submit}
      busy={loading}
      width="sm"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!value.trim()} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
        <input ref={inputRef} value={value} maxLength={80} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className={inputClass} />
      </label>
    </Sheet>
  );
}
