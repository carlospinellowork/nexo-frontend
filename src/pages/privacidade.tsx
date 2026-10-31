import { createFileRoute } from "@tanstack/react-router";
import { PRIVACY } from "../features/legal/content";
import { LegalPage } from "../features/legal/LegalPage";

export const Route = createFileRoute("/privacidade")({
  component: () => (
    <LegalPage
      title="Política de Privacidade"
      intro="Como o Nexo trata os dados de quem usa o painel e dos visitantes das bios, páginas e bots."
      sections={PRIVACY}
      other={{ to: "/termos", label: "Termos de Uso" }}
    />
  ),
});
