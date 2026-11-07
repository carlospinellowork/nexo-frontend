import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useGetBio } from "../../api/queries/useGetBio";
import { Button } from "../../shared/components/ui/Button";
import { Instagram, Link2, Send } from "../../shared/icons";
import { bioUrl } from "./bioUrl";
import { PutOnInstagramSheet } from "./PutOnInstagram";

/**
 * O próximo passo da jornada nas telas vazias (Leads, Resultados): criar a bio, publicá-la ou divulgar o link.
 * Assim a pessoa nunca para numa tela vazia sem saber o que fazer.
 */
export function BioNextStep() {
  const { data: bio, isLoading } = useGetBio();
  const navigate = useNavigate();
  const [ig, setIg] = useState(false);
  if (isLoading) return null;

  if (!bio) {
    return (
      <Button icon={Link2} onClick={() => navigate({ to: "/minha-bio" })}>
        Criar minha bio
      </Button>
    );
  }
  if (!bio.publishedAt) {
    return (
      <Button icon={Send} onClick={() => navigate({ to: "/minha-bio" })}>
        Publicar minha bio
      </Button>
    );
  }
  return (
    <>
      <Button variant="gold" icon={Instagram} onClick={() => setIg(true)}>
        Colocar no Instagram
      </Button>
      <PutOnInstagramSheet url={bioUrl(bio.slug)} open={ig} onClose={() => setIg(false)} />
    </>
  );
}
