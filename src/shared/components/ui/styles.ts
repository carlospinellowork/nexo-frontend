/** Classes compartilhadas dos controles de formulário (estilo iOS). */
export const inputClass =
  "w-full h-11 rounded-xl border border-border-ui bg-panel-2 px-3.5 text-[15px] text-text-primary placeholder:text-text-secondary/70 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-4 focus:ring-primary/15";

export const textareaClass = `${inputClass} h-auto min-h-24 py-3 leading-relaxed resize-none`;

export const selectClass = `${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa6bc' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`;

export const cardClass = "rounded-3xl bg-panel shadow-card";

/** Curva e duração padrão das animações (sensação iOS). */
export const spring = { type: "spring", stiffness: 420, damping: 32 } as const;
export const ease = [0.2, 0.8, 0.2, 1] as const;
