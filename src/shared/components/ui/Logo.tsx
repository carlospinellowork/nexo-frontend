export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#8B6CFF] to-[#5B3FD1] shadow-[0_6px_16px_rgb(109_74_255/0.35)]"
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#FFC400" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 19V5l14 14V5" />
      </svg>
    </span>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-extrabold tracking-tight text-text-primary" style={{ fontSize: size * 0.56 }}>
        Nexo
      </span>
    </span>
  );
}
