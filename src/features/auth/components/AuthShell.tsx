import type { ReactNode } from "react";
import { Logo } from "../../../shared/components/ui/Logo";
import { ThemeToggleButton } from "../../../shared/components/ui/ThemeToggle";
import { LoginHero } from "./LoginHero";
import { MeshBackground } from "./MeshBackground";

/** Moldura das telas de acesso (entrar e redefinir senha): vitrine ao lado e o conteúdo num painel. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-panel lg:h-screen lg:flex-row lg:overflow-hidden">
      <LoginHero />

      {/* Celular e tablet: faixa do topo com o fundo vivo; o formulário sobe num painel por cima dela. */}
      <header className="relative isolate flex min-h-[min(30dvh,240px)] shrink-0 flex-col justify-between gap-6 overflow-hidden px-5 pb-12 pt-[max(1rem,env(safe-area-inset-top))] text-white lg:hidden">
        <MeshBackground />
        <div className="relative flex items-center justify-between">
          <Logo size={30} tone="light" />
          <ThemeToggleButton glass />
        </div>
        <p className="relative max-w-[18ch] font-display text-[26px] font-bold leading-[1.08] tracking-[-0.02em]">Sua empresa no digital, num lugar só.</p>
      </header>

      <section className="relative z-10 -mt-6 flex flex-1 flex-col rounded-t-[24px] bg-panel px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 shadow-[0_-12px_30px_-12px_rgb(13_10_31/0.35)] sm:px-8 lg:mt-0 lg:items-center lg:justify-center lg:overflow-y-auto lg:rounded-none lg:p-8 lg:shadow-none">
        <div className="absolute right-8 top-8 hidden lg:block">
          <ThemeToggleButton />
        </div>
        {children}
      </section>
    </div>
  );
}
