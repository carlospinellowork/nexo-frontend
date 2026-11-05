export type IconMotion = "float" | "pulse" | "wiggle" | "spin" | "bounce";

export const ICON_MOTIONS: { value: IconMotion | ""; label: string }[] = [
  { value: "", label: "Fixo" },
  { value: "float", label: "Flutuar" },
  { value: "pulse", label: "Pulsar" },
  { value: "wiggle", label: "Balançar" },
  { value: "spin", label: "Girar" },
  { value: "bounce", label: "Pular" },
];

export const ICON_LOOPS: Record<IconMotion, { animate: Record<string, number[]>; duration: number; repeatDelay?: number; ease?: "linear" | "easeInOut" }> = {
  float: { animate: { y: [0, -3, 0] }, duration: 2.6, ease: "easeInOut" },
  pulse: { animate: { scale: [1, 1.16, 1] }, duration: 1.8, ease: "easeInOut" },
  wiggle: { animate: { rotate: [0, -12, 10, -6, 0] }, duration: 1.2, repeatDelay: 1.6, ease: "easeInOut" },
  spin: { animate: { rotate: [0, 360] }, duration: 6, ease: "linear" },
  bounce: { animate: { y: [0, -6, 0, -2, 0] }, duration: 1.1, repeatDelay: 1.4, ease: "easeInOut" },
};
