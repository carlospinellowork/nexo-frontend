import type { InputHTMLAttributes } from "react";
import type { Mail } from "../../../shared/icons";

export function IconInput({ id, label, icon: Icon, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; icon: typeof Mail }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
      <span className="group flex h-12 items-center gap-2.5 rounded-xl border border-border-ui bg-panel-2 px-3.5 text-text-secondary transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15 lg:h-11">
        <Icon size={18} className="shrink-0 transition-colors group-focus-within:text-primary" />
        <input id={id} className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-text-primary outline-none placeholder:text-text-secondary/60 lg:text-[15px]" {...props} />
      </span>
    </label>
  );
}
