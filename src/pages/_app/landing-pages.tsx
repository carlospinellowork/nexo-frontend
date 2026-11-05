import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bot, ChevronRight, ExternalLink, Globe, Link2, Loader2, Pencil, Plus, Sparkles, Trash2 } from "../../shared/icons";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { type CreateLandingPagePayload, useCreateLandingPage } from "../../api/mutations/useCreateLandingPage";
import { useDeleteLandingPage } from "../../api/mutations/useDeleteLandingPage";
import { useGetLandingPages } from "../../api/queries/useGetLandingPages";
import { CreatePageDialog } from "../../features/landing/components/CreatePageDialog";
import { LandingRenderer } from "../../features/landing/components/LandingRenderer";
import { startTour } from "../../features/tour/driver-service";
import { HelpButton } from "../../features/tour/HelpButton";
import { Header } from "../../shared/components/layout/Header";
import { ToolTabs } from "../../shared/components/layout/ToolTabs";
import { Badge } from "../../shared/components/ui/Badge";
import { Button, IconButton } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { toast } from "../../shared/components/ui/toast-store";

export const Route = createFileRoute("/_app/landing-pages")({
  component: LandingPagesPage,
});

function LandingPagesPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: pages, isLoading } = useGetLandingPages();
  const { mutateAsync: createPage, isPending: creating } = useCreateLandingPage();
  const { mutate: deletePage } = useDeleteLandingPage();

  useEffect(() => {
    const timer = setTimeout(() => startTour("landing"), 700);
    return () => clearTimeout(timer);
  }, []);

  const create = async (payload: CreateLandingPagePayload) => {
    try {
      if (payload.layout === "bio") {
        setDialogOpen(false);
        navigate({ to: "/minha-bio" });
        return;
      }
      const page = await createPage(payload);
      setDialogOpen(false);
      if (payload.useAi && !page.aiUsed) toast.success("Página criada pelo modelo: a IA não está disponível agora.");
      else toast.success(page.aiUsed ? "A IA escreveu a página. Revise os textos e publique." : "Página criada. Troque os textos de exemplo e publique.");
      navigate({ to: "/landing-builder", search: { id: page.id } });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a página."));
    }
  };

  const remove = (id: string, title: string) => {
    if (!window.confirm(`Excluir a página "${title}"? Ela sai do ar e não dá para desfazer.`)) return;
    deletePage(id, {
      onSuccess: () => toast.success("Página excluída."),
      onError: (err) => toast.error(apiErrorMessage(err, "Não foi possível excluir a página.")),
    });
  };

  const bios = pages?.filter((p) => p.settings.layout === "bio") ?? [];
  const sitePages = pages?.filter((p) => p.settings.layout !== "bio") ?? [];

  const newButton = (
    <Button icon={Plus} onClick={() => setDialogOpen(true)}>
      Nova página
    </Button>
  );

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Páginas"
        tabs={<ToolTabs area="pages" />}
        actions={
          <div className="flex items-center gap-2">
            <span id="tour-landing-new">{newButton}</span>
            <HelpButton tourKey="landing" screenTitle="Landing pages" />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : !pages?.length ? (
          <EmptyState icon={Globe} title="Nenhuma página ainda" description="Descreva a sua empresa e a IA escreve uma landing page pronta, com o seu bot atendendo os visitantes.">
            <Button icon={Sparkles} onClick={() => setDialogOpen(true)}>
              Criar a primeira página
            </Button>
          </EmptyState>
        ) : (
          <div id="tour-landing-cards" className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 md:px-6 md:py-5">
            {bios.map((p) => (
              <button key={p.id} type="button" onClick={() => navigate({ to: "/minha-bio" })} className="flex min-h-14 items-center gap-3 rounded-2xl border border-border-ui/70 bg-panel p-3 text-left shadow-card transition-colors hover:bg-panel-hover">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Link2 size={17} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold text-text-primary">Sua bio: {p.title}</span>
                  <span className="truncate font-mono text-[12px] text-text-secondary">/{p.slug}</span>
                </span>
                <span className="hidden text-[13px] font-semibold text-primary-strong sm:inline">Abrir em Minha Bio</span>
                <ChevronRight size={16} className="shrink-0 text-text-secondary" />
              </button>
            ))}
            {!sitePages.length ? (
              <EmptyState icon={Globe} title="Nenhuma página ainda" description="Uma página completa para vender, além da sua bio. Descreva a empresa e a IA escreve.">
                <Button icon={Sparkles} onClick={() => setDialogOpen(true)}>
                  Criar a primeira página
                </Button>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {sitePages.map((p, i) => {
                  const edit = () => navigate({ to: "/landing-builder", search: { id: p.id } });
                  return (
                    <motion.article key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 32, delay: i * 0.05 }} whileHover={{ y: -3 }} className="group flex flex-col overflow-hidden rounded-2xl border border-border-ui/70 bg-panel shadow-card transition-shadow hover:shadow-float">
                      <button type="button" onClick={edit} aria-label={`Editar ${p.title}`} className="relative block h-48 w-full overflow-hidden border-b border-border-ui/70 text-left">
                        {/* A própria página, em miniatura: o que o visitante vê, e não uma imagem guardada. */}
                        <span aria-hidden className="pointer-events-none absolute left-0 top-0 block w-[400%] origin-top-left scale-[0.25] transition-transform duration-500 group-hover:-translate-y-[6%]" inert>
                          <LandingRenderer title={p.title} theme={p.theme} sections={p.sections} settings={p.settings} slug={p.slug} onChat={() => undefined} />
                        </span>
                      </button>
                      <div className="flex flex-1 flex-col gap-2 p-3.5">
                        <div className="flex items-start gap-2">
                          <h2 className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-text-primary">{p.title}</h2>
                          {!p.publishedAt ? <Badge tone="neutral">Rascunho</Badge> : p.hasUnpublishedChanges ? <Badge tone="accent">Com mudanças</Badge> : <Badge tone="success">No ar</Badge>}
                        </div>
                        <p className="truncate font-mono text-[12px] text-text-secondary">/p/{p.slug}</p>
                        <p className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                          <Bot size={14} className="shrink-0" />
                          <span className="truncate">{p.chat ? p.chat.name : "Sem bot vinculado"}</span>
                        </p>
                        <div className="mt-auto flex items-center gap-1 pt-1">
                          <Button size="sm" variant="secondary" icon={Pencil} onClick={edit}>
                            Editar
                          </Button>
                          {p.publishedAt && (
                            <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-text-secondary transition-colors hover:bg-panel-hover hover:text-text-primary" title="Abrir a página no ar" aria-label="Abrir a página no ar">
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <IconButton icon={Trash2} label="Excluir página" size={36} className="ml-auto hover:text-danger" onClick={() => remove(p.id, p.title)} />
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <CreatePageDialog open={dialogOpen} loading={creating} onClose={() => setDialogOpen(false)} onCreate={(payload) => void create(payload)} />
    </div>
  );
}
