import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, Instagram, Link2, Loader2, MousePointerClick, Sparkles } from "../../shared/icons";
import { useState } from "react";
import { useGetLandingClicks } from "../../api/queries/useGetLandingClicks";
import { useGetBio } from "../../api/queries/useGetBio";
import { toast } from "../../shared/components/ui/toast-store";
import { bioUrl } from "./bioUrl";
import { PutOnInstagramSheet } from "./PutOnInstagram";

/** Cartão grande do Início: criar a bio ou, com ela pronta, o link e os cliques. */
export function BioHomeCard() {
  const { data: page, isLoading } = useGetBio();
  const { data: stats } = useGetLandingClicks(page?.id);
  const [copied, setCopied] = useState(false);
  const [ig, setIg] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-36 items-center justify-center rounded-2xl bg-panel shadow-card">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#4B2FD0] p-4 text-white shadow-float md:p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#FFC400] opacity-30 blur-3xl" />
        <span className="relative flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold">
          <Sparkles size={14} /> Pronta em 2 minutos
        </span>
        <h2 className="relative mt-2.5 text-[22px] font-bold leading-tight tracking-tight">Crie sua bio que conversa</h2>
        <p className="relative mt-1.5 max-w-xl text-[14px] leading-relaxed text-white/85">Seus links, Pix e produtos numa página só, com um assistente que responde seus seguidores sozinho.</p>
        <Link to="/minha-bio" className="nx-btn-gold nx-anim relative mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-5 text-[15px] font-semibold active:scale-[0.98] sm:w-fit md:h-10">
          Criar minha bio
          <ArrowRight size={17} data-gesture="nudge" />
        </Link>
      </div>
    );
  }

  const last7 = Object.values(stats?.items ?? {}).reduce((sum, i) => sum + i.last7, 0);
  const url = bioUrl(page.slug);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-ui/70 bg-panel p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-primary-strong">
            <Link2 size={14} /> Sua bio
          </span>
          <h2 className="truncate text-[20px] font-bold tracking-tight text-text-primary">{page.title}</h2>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-display flex items-center gap-1 text-[24px] font-bold tabular-nums text-text-primary">
            <MousePointerClick size={20} className="text-text-secondary" />
            {last7}
          </span>
          <span className="text-[12px] text-text-secondary">cliques em 7 dias</span>
        </div>
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-panel-2 p-1 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-text-primary">{url}</span>
        <button type="button" onClick={() => void copy()} aria-label="Copiar o link da bio" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-panel-hover md:h-9 md:w-9">
          {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {page.publishedAt && (
          <button type="button" onClick={() => setIg(true)} className="nx-btn-gold nx-anim inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-5 text-[14px] font-semibold active:scale-[0.98] sm:w-fit md:h-10">
            <Instagram size={17} />
            Colocar no Instagram
          </button>
        )}
        <Link to="/minha-bio" className="nx-btn-primary nx-anim inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-5 text-[14px] font-semibold active:scale-[0.98] sm:w-fit md:h-10">
          Editar minha bio
          <ArrowRight size={16} data-gesture="nudge" />
        </Link>
      </div>
      {page.publishedAt && <PutOnInstagramSheet url={url} open={ig} onClose={() => setIg(false)} />}
    </div>
  );
}
