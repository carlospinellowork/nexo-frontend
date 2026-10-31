import { SealRosette } from "./NexoSeal";

/** Símbolo do Nexo: o selo holográfico (roseta) com o N roxo e amarelo. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return <SealRosette size={size} />;
}

/** tone="light": texto branco, para fundos escuros (ex.: o lado animado do login). */
export function Logo({ size = 36, tone = "auto" }: { size?: number; tone?: "auto" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className={`font-display font-extrabold tracking-tight ${tone === "light" ? "text-white" : "text-text-primary"}`} style={{ fontSize: size * 0.56 }}>
        Nexo
      </span>
    </span>
  );
}
