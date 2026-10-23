import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

export const resolveTheme = (pref: ThemePreference): ResolvedTheme =>
  pref === "system" ? (media().matches ? "dark" : "light") : pref;

function apply(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: "system",
      resolved: resolveTheme("system"),
      setPreference: (preference) => {
        const resolved = resolveTheme(preference);
        apply(resolved);
        set({ preference, resolved });
      },
      toggle: () => get().setPreference(get().resolved === "dark" ? "light" : "dark"),
    }),
    {
      name: "nexo-theme",
      partialize: (s) => ({ preference: s.preference }),
      onRehydrateStorage: () => (state) => state?.setPreference(state.preference),
    },
  ),
);

/** Acompanha a mudança de tema do sistema quando a preferência é "system". */
export function watchSystemTheme() {
  media().addEventListener("change", () => {
    const { preference, setPreference } = useThemeStore.getState();
    if (preference === "system") setPreference("system");
  });
}
