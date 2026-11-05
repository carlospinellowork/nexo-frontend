/** Classes compartilhadas dos controles de formulário (estilo iOS). */
export const inputClass =
  "w-full h-11 md:h-9 rounded-[10px] border border-border-ui bg-panel-2 px-3 text-[15px] md:text-[14px] text-text-primary placeholder:text-text-secondary/70 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-[3px] focus:ring-primary/15";

export const textareaClass = `${inputClass} h-auto md:h-auto min-h-24 py-2.5 leading-relaxed resize-none`;


export const cardClass = "rounded-2xl bg-panel shadow-card";

/** Curva e duração padrão das animações (sensação iOS). */
export const spring = { type: "spring", stiffness: 420, damping: 32 } as const;
export const ease = [0.2, 0.8, 0.2, 1] as const;
