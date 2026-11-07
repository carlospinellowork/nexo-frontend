import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { savePendingInvite } from "../features/team/pendingInvite";
import { LogoMark } from "../shared/components/ui/Logo";

export const Route = createFileRoute("/convite/$token")({
  component: InvitePage,
});

/** Link de convite para a conta: guarda o convite e leva ao login; depois de entrar, o painel aceita sozinho. */
function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    savePendingInvite(token);
    void navigate({ to: "/", replace: true });
  }, [token, navigate]);
  return (
    <div className="flex h-screen items-center justify-center bg-bg-start">
      <LogoMark size={56} />
    </div>
  );
}
