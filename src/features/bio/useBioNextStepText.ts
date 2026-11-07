import { useGetBio } from "../../api/queries/useGetBio";

/** Texto da tela vazia conforme o estado da bio, para combinar com o botão acima. */
export function useBioNextStepText(what: string) {
  const { data: bio } = useGetBio();
  if (!bio) return `Crie a sua bio: é por ela que chegam ${what}.`;
  if (!bio.publishedAt) return `Publique a sua bio: é por ela que chegam ${what}.`;
  return `Sua bio está no ar. Coloque o link no Instagram, no Google e no QR do balcão para chegarem ${what}.`;
}
