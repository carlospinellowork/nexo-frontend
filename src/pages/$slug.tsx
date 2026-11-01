import { createFileRoute } from "@tanstack/react-router";
import { PublicLandingPage } from "../features/landing/public/PublicLandingPage";

/**
 * Endereço curto das bios (ex.: nxbio.vercel.app/studiojoana). As rotas do painel (/login, /leads...) são fixas e
 * vêm antes desta; a API não deixa criar bio com esses nomes (RESERVED_SLUGS no backend).
 */
export const Route = createFileRoute("/$slug")({
  component: function ShortBio() {
    const { slug } = Route.useParams();
    return <PublicLandingPage slug={slug} />;
  },
});
