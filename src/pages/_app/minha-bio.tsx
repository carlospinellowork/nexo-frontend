import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Link2, Loader2, MessagesSquare, PartyPopper, Pencil } from "../../shared/icons";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useGetBio } from "../../api/queries/useGetBio";
import { BioEditor } from "../../features/bio/BioEditor";
import { BioShare } from "../../features/bio/BioShare";
import { BioWizard } from "../../features/bio/BioWizard";
import { bioUrl } from "../../features/bio/bioUrl";
import { PutOnInstagram } from "../../features/bio/PutOnInstagram";
import type { LandingPageRecord } from "../../features/landing/contract";
import { Button } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";

export const Route = createFileRoute("/_app/minha-bio")({
  component: MinhaBioPage,
  validateSearch: (search: Record<string, unknown>): { instagram?: boolean } => (search.instagram ? { instagram: true } : {}),
});

/** O que o kit já montou junto com a bio: a conversa ligada e, se ela marca horário, o convite para conferir a agenda. */
function KitReady({ page, onAgenda }: { page: LandingPageRecord; onAgenda: () => void }) {
  const journey = page.settings.bio?.journey;
  if (!page.settings.journeyFirst || !journey) return null;
  const books = journey.steps.some((s) => s.kind === "booking");
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-primary/20 bg-primary/8 p-4">
      <p className="flex items-start gap-2.5 text-[14.5px] leading-snug text-text-primary">
        <MessagesSquare size={18} className="mt-0.5 shrink-0 text-primary" />
        <span>
          <b>Sua bio já abre numa conversa.</b> Ela responde as suas perguntas e leva o cliente {books ? "a marcar um horário" : "até o seu WhatsApp com o pedido pronto"}.
        </span>
      </p>
      {books && (
        <>
          <p className="text-[14px] leading-snug text-text-secondary">
            Se a sua agenda estava vazia, criamos serviços de exemplo, sem preço. Confira os serviços, os dias e horários em que você atende, e se as reservas entram direto ou chegam para você confirmar.
          </p>
          <Button variant="outline" icon={Calendar} onClick={onAgenda} className="self-start">
            Conferir serviços e horários
          </Button>
        </>
      )}
    </div>
  );
}

/** "Minha Bio": com bio, abre o editor; sem bio, a criação guiada. A bio é uma LandingPage com layout "bio". */
function MinhaBioPage() {
  const { data: page, isLoading, isError } = useGetBio();
  const { instagram } = Route.useSearch();
  const [mode, setMode] = useState<"auto" | "wizard" | "done">("auto");
  const [created, setCreated] = useState<LandingPageRecord | null>(null);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }
  if (isError) return <EmptyState icon={Link2} title="Não foi possível abrir a sua bio" description="Confira a conexão e tente de novo." />;

  if (mode === "done" && created) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/14 text-success-strong">
              <PartyPopper size={28} />
            </span>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary">Sua bio está no ar</h1>
            <p className="text-[15px] text-text-secondary">Agora coloque o link no Instagram para os seguidores chegarem até você.</p>
          </div>
          <div className="rounded-3xl bg-panel p-5 shadow-card">
            <PutOnInstagram url={bioUrl(created.slug)} />
          </div>
          <KitReady page={created} onAgenda={() => void navigate({ to: "/agenda" })} />
          <p className="text-center text-[13px] text-text-secondary">Sem tempo agora? O botão <b>Instagram</b> fica no alto da sua bio e no Início.</p>
          <BioShare slug={created.slug} name={created.title} />
          <Button size="lg" variant="outline" icon={Pencil} onClick={() => setMode("auto")} className="w-full">
            Editar minha bio
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "wizard" || (mode === "auto" && !page)) {
    return (
      <BioWizard
        onLock={() => setMode("wizard")}
        onCreated={(p) => {
          setCreated(p);
          setMode("done");
        }}
      />
    );
  }

  return page ? <BioEditor key={page.id} page={page} openInstagram={instagram} /> : null;
}
