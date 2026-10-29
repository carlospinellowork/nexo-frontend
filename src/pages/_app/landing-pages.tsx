import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bot, ExternalLink, Globe, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../api/instance";
import { type CreateLandingPagePayload, useCreateLandingPage } from "../../api/mutations/useCreateLandingPage";
import { useDeleteLandingPage } from "../../api/mutations/useDeleteLandingPage";
import { useGetLandingPages } from "../../api/queries/useGetLandingPages";
import { CreatePageDialog } from "../../features/landing/components/CreatePageDialog";
import { THEME_INFO } from "../../features/landing/contract";
import { startTour } from "../../features/tour/driver-service";
import { HelpButton } from "../../features/tour/HelpButton";
import { Header } from "../../shared/components/layout/Header";
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

  const newButton = (
    <Button icon={Plus} onClick={() => setDialogOpen(true)}>
      Nova página
    </Button>
  );

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Landing pages"
        subtitle="Páginas de venda escritas pela IA, com o seu bot atendendo"
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
          <div id="tour-landing-cards" className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 p-8 sm:grid-cols-2 xl:grid-cols-3">
            {pages.map((p, i) => {
              const theme = THEME_INFO[p.theme];
              const isBio = p.settings.layout === "bio";
              const edit = () => (isBio ? navigate({ to: "/minha-bio" }) : navigate({ to: "/landing-builder", search: { id: p.id } }));
              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 32, delay: i * 0.04 }}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-panel shadow-card transition-shadow hover:shadow-float"
                >
                  <button type="button" onClick={edit} className="relative flex h-28 items-end p-4 text-left" style={{ background: theme.colors[0] }} aria-label={`Editar ${p.title}`}>
                    <span className="absolute right-4 top-4 h-8 w-8 rounded-full" style={{ background: theme.colors[1] }} aria-hidden />
                    <span className="line-clamp-2 text-[17px] font-bold leading-tight" style={{ color: theme.colors[2] }}>
                      {p.title}
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isBio && <Badge tone="primary">Minha Bio</Badge>}
                      {!p.publishedAt ? (
                        <Badge tone="neutral">Rascunho</Badge>
                      ) : p.hasUnpublishedChanges ? (
                        <Badge tone="accent">No ar, com mudanças</Badge>
                      ) : (
                        <Badge tone="success">No ar</Badge>
                      )}
                      <span className="text-[12px] text-text-secondary">{isBio ? "" : `Landing page, `}{theme.name}</span>
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
                        <a
                          href={`/p/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-[10px] text-text-secondary transition-colors hover:bg-panel-hover hover:text-text-primary"
                          title="Abrir a página no ar"
                          aria-label="Abrir a página no ar"
                        >
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

      <CreatePageDialog open={dialogOpen} loading={creating} onClose={() => setDialogOpen(false)} onCreate={(payload) => void create(payload)} />
    </div>
  );
}
