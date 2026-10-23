export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#0A6CFF] to-[#7C5CFF] shadow-[0_6px_16px_rgb(10_108_255/0.3)]"
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
