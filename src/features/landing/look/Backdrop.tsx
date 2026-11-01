import { backgroundStyle } from "./pattern";
import { isHex } from "./resolve";
import type { Background } from "./types";

const BLOBS = [
  "left-[-20%] top-[-10%] h-[60%] w-[80%] nx-mesh-a",
  "right-[-25%] top-[25%] h-[55%] w-[75%] nx-mesh-b",
  "bottom-[-15%] left-[5%] h-[50%] w-[70%] nx-mesh-c",
];

/** Fundo da bio: fica atrás de tudo e cobre a página inteira. Na galeria de temas, sem animação. */
export function Backdrop({ bg, animate = true, className = "" }: { bg: Background; animate?: boolean; className?: string }) {
  if (bg.type !== "mesh") return <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 ${className}`} style={backgroundStyle(bg)} />;
  const [base, ...spots] = bg.colors.filter(isHex);
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${animate ? "" : "nx-mesh-still"} ${className}`} style={{ backgroundColor: base ?? "#050816" }}>
      {spots.slice(0, 3).map((c, i) => (
        <span key={i} className={`absolute rounded-full opacity-70 blur-[60px] ${BLOBS[i]}`} style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}
