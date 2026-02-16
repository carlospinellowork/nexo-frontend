import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: IndexComponent,
});

function IndexComponent() {
  return <div>Bem-vindo à Home!</div>;
}
