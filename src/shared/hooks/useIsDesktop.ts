import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px)";

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/** Telas em que o computador tem outro layout, não só a mesma coluna mais larga. */
export const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
