import { createFileRoute } from "@tanstack/react-router";
import { Link2, Loader2, PartyPopper, Pencil } from "lucide-react";
import { useState } from "react";
import { useGetBio } from "../../api/queries/useGetBio";
import { BioEditor } from "../../features/bio/BioEditor";
import { BioShare } from "../../features/bio/BioShare";
import { BioWizard } from "../../features/bio/BioWizard";
import type { LandingPageRecord } from "../../features/landing/contract";
import { Button } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";

export const Route = createFileRoute("/_app/minha-bio")({
  component: MinhaBioPage,
});

/** "Minha Bio": com bio, abre o editor; sem bio, a criação guiada. A bio é uma LandingPage com layout "bio". */
function MinhaBioPage() {
  const { data: page, isLoading, isError } = useGetBio();
  const [mode, setMode] = useState<"auto" | "wizard" | "done">("auto");
  const [created, setCreated] = useState<LandingPageRecord | null>(null);

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
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/14 text-success-strong">
              <PartyPopper size={28} />
            </span>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-text-primary">Sua bio está no ar</h1>
            <p className="text-[15px] text-text-secondary">O bot já responde as suas perguntas. Agora é só colocar o link onde os seguidores te encontram.</p>
          </div>
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

  return page ? <BioEditor key={page.id} page={page} /> : null;
}
