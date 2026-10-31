import { createFileRoute } from "@tanstack/react-router";
import { TERMS } from "../features/legal/content";
import { LegalPage } from "../features/legal/LegalPage";

export const Route = createFileRoute("/termos")({
  component: () => (
    <LegalPage
      title="Termos de Uso"
      intro="Estas são as regras para usar o Nexo. Escrevemos em linguagem simples; leia com calma."
      sections={TERMS}
      other={{ to: "/privacidade", label: "Política de Privacidade" }}
    />
  ),
});
