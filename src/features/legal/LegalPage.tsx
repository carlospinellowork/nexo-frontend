import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "../../shared/icons";
import { Logo } from "../../shared/components/ui/Logo";
import { LEGAL, type LegalSection } from "./content";

/** Página pública de texto legal (termos e privacidade): leitura confortável no celular e nos dois temas. */
export function LegalPage({ title, intro, sections, other }: { title: string; intro: string; sections: LegalSection[]; other: { to: "/termos" | "/privacidade"; label: string } }) {
  return (
    <div className="min-h-dvh bg-bg-start">
      <header className="sticky top-0 z-10 border-b border-border-ui bg-[var(--nx-glass)] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link to="/" aria-label="Voltar ao Nexo" className="flex items-center gap-2">
            <ArrowLeft size={18} className="text-text-secondary" />
            <Logo size={26} />
          </Link>
          <Link to={other.to} className="text-[13.5px] font-semibold text-primary-strong hover:underline">
            {other.label}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 md:pt-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-text-primary md:text-[34px]">{title}</h1>
          <p className="text-[13px] text-text-secondary">Atualizado em {LEGAL.updatedAt}. Nexo em fase de testes.</p>
          <p className="text-[15.5px] leading-relaxed text-text-primary">{intro}</p>
        </div>

        {sections.map((s, i) => (
          <section key={s.title} className="flex flex-col gap-2" aria-labelledby={`sec-${i}`}>
            <h2 id={`sec-${i}`} className="text-[18px] font-bold tracking-tight text-text-primary">
              {i + 1}. {s.title}
            </h2>
            {s.paragraphs?.map((p) => (
              <p key={p.slice(0, 40)} className="text-[15px] leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
            {s.items && (
              <ul className="flex flex-col gap-1.5 pl-5">
                {s.items.map((it) => (
                  <li key={it.slice(0, 40)} className="list-disc text-[15px] leading-relaxed text-text-secondary marker:text-primary">
                    {it}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="rounded-xl border border-border-ui bg-panel p-4 text-[14px] leading-relaxed text-text-secondary">
          Dúvidas ou pedidos sobre os seus dados: <a className="font-semibold text-primary-strong underline" href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
        </p>
      </main>
    </div>
  );
}
