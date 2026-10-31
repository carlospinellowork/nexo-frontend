import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// Luzes da marca (roxo, violeta, rosa, dourado e ciano). Cada uma passeia devagar numa órbita própria.
const BLOBS = [
  { c: "109,74,255", x: 0.18, y: 0.28, r: 0.62, sx: 0.13, sy: 0.17, a: 0.62 },
  { c: "255,122,217", x: 0.85, y: 0.22, r: 0.48, sx: 0.11, sy: 0.09, a: 0.45 },
  { c: "255,196,0", x: 0.72, y: 0.88, r: 0.46, sx: 0.07, sy: 0.12, a: 0.5 },
  { c: "72,36,214", x: 0.25, y: 0.92, r: 0.55, sx: 0.09, sy: 0.08, a: 0.7 },
  { c: "126,232,255", x: 0.55, y: 0.5, r: 0.3, sx: 0.15, sy: 0.1, a: 0.32 },
] as const;

const BASE = "#0d0a1f";

// Grão por cima das luzes (tira o ar de "gradiente de template").
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>\")";

/**
 * Fundo vivo do Nexo: luzes que se movem devagar num canvas pequeno, com grão por cima.
 * Pausa quando a aba não está visível e fica parado para quem pede menos movimento.
 */
export function MeshBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Desenha em resolução baixa (as luzes são borradas, não precisam de mais) e o CSS estica.
    // Em telas de toque (celular), resolução menor e metade dos quadros: poupa bateria e não trava a rolagem.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const SCALE = touch ? 0.25 : 0.35;
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    };
    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of BLOBS) {
        const x = (b.x + Math.sin(t * b.sx) * 0.16) * w;
        const y = (b.y + Math.cos(t * b.sy) * 0.16) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${b.c},${b.a})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduce) draw(4);
    });
    observer.observe(canvas);

    if (reduce) {
      draw(4);
      return () => observer.disconnect();
    }

    let raf = 0;
    let frame = 0;
    const loop = (ms: number) => {
      if (!touch || frame++ % 2 === 0) draw(ms / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: BASE }}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  );
}
