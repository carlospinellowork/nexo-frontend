import type { CSSProperties, PointerEvent } from "react";

/** Borda recortada da roseta (24 pontas), calculada uma vez. */
const ROSETTE_CLIP = (() => {
  const points: string[] = [];
  const n = 24;
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n;
    const r = i % 2 ? 46 : 50;
    points.push(`${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`);
  }
  return `polygon(${points.join(",")})`;
})();

/** O reflexo do holográfico segue o ponteiro. */
function followPointer(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--nx-mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  el.style.setProperty("--nx-my", `${((e.clientY - r.top) / r.height) * 100}%`);
}
function resetPointer(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.removeProperty("--nx-mx");
  e.currentTarget.style.removeProperty("--nx-my");
}
const holoHandlers = { onPointerMove: followPointer, onPointerLeave: resetPointer };

/** O N do Nexo: roxo com o amarelo brilhando por trás. */
export function NMark({ size, ink = 3, glow = 6 }: { size: number; ink?: number; glow?: number }) {
  return (
    <svg className="nx-nmark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path className="nx-n-glow" d="M5 19V5l14 14V5" strokeWidth={glow} />
      <path className="nx-n-ink" d="M5 19V5l14 14V5" strokeWidth={ink} />
    </svg>
  );
}

/**
 * A · Roseta: o símbolo da marca (logo do painel, favicon, ícone do app). Holográfico perolado com o N no meio.
 * Em tamanhos pequenos (< 24 px) a borda recortada some e vira um círculo, para continuar legível.
 */
export function SealRosette({ size = 36, className = "", label }: { size?: number; className?: string; label?: string }) {
  const small = size < 24;
  const style: CSSProperties = { width: size, height: size, clipPath: small ? undefined : ROSETTE_CLIP, borderRadius: small ? "50%" : undefined };
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`nx-holo inline-grid shrink-0 place-items-center drop-shadow-[0_4px_10px_rgb(109_74_255/0.28)] ${className}`}
      style={style}
      {...holoHandlers}
    >
      <span
        className="grid place-items-center rounded-full bg-white/55 shadow-[inset_0_0_0_1.5px_rgb(109_74_255/0.35),inset_0_2px_8px_rgb(109_74_255/0.12)]"
        style={{ width: small ? "100%" : "76%", height: small ? "100%" : "76%" }}
      >
        <NMark size={Math.round(size * (small ? 0.62 : 0.4))} ink={small ? 3.4 : 3} glow={small ? 6.5 : 6} />
      </span>
    </span>
  );
}

/** B · Pílula "feito com Nexo": rodapé das bios e páginas. */
export function SealPill({ href, onClick, className = "" }: { href?: string; onClick?: () => void; className?: string }) {
  const content = (
    <>
      <NMark size={11} ink={3} glow={0} />
      <span>feito com Nexo</span>
    </>
  );
  // Discreto de propósito: a marca do cliente é que aparece. O selo só ganha força ao passar o mouse.
  const cls = `inline-flex min-h-6 items-center gap-1 text-[11px] font-medium no-underline opacity-55 transition-opacity hover:opacity-100 ${className}`;
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener" className={cls}>
        {content}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {content}
      </button>
    );
  return <span className={cls}>{content}</span>;
}

/** C · Carimbo "Verificado pelo Nexo": relatório de campanha e mídia kit. */
export function SealStamp({ className = "" }: { className?: string }) {
  return (
    <span
      className={`nx-holo inline-grid grid-cols-[auto_auto] items-center gap-2 rounded-[14px] py-2 pl-2 pr-3.5 shadow-[inset_0_0_0_1px_rgb(109_74_255/0.25),0_8px_20px_rgb(109_74_255/0.2)] ${className}`}
      {...holoHandlers}
    >
      <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white/70 shadow-[inset_0_0_0_1.5px_rgb(109_74_255/0.35)]">
        <NMark size={20} ink={2.4} glow={5} />
      </span>
      <span className="flex flex-col">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#5d5875]">Verificado</span>
        <b className="text-[13px] font-extrabold leading-tight text-[#6d4aff]">pelo Nexo</b>
      </span>
    </span>
  );
}
