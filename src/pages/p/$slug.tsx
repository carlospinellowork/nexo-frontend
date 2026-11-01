import { createFileRoute } from "@tanstack/react-router";
import { PublicLandingPage } from "../../features/landing/public/PublicLandingPage";

export const Route = createFileRoute("/p/$slug")({
  component: function PublicBySlug() {
    const { slug } = Route.useParams();
    return <PublicLandingPage slug={slug} />;
  },
});
