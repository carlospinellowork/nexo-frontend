import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { api } from "../../api/instance";
import { toast } from "../../shared/components/ui/toast-store";
import { useWorkspaceStore } from "../workspaces/store/workspace-store";
import { takePendingInvite } from "./pendingInvite";

/** Na parte logada: aceita o convite aberto antes do login e já abre a conta do negócio. */
export function AcceptPendingInvite() {
  const queryClient = useQueryClient();
  const setActive = useWorkspaceStore((s) => s.setActiveWorkspaceId);
  const navigate = useNavigate();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const token = takePendingInvite();
    if (!token) return;
    api
      .post<{ workspaceId: string; name: string }>(`/invites/${encodeURIComponent(token)}/accept`)
      .then(async ({ data }) => {
        setActive(data.workspaceId);
        await Promise.all([queryClient.invalidateQueries({ queryKey: ["workspaces"] }), queryClient.invalidateQueries({ queryKey: ["me"] })]);
        toast.success(`Você entrou na conta ${data.name}.`);
        // Atendente começa pela agenda do negócio (e pula o "conhecer você", que o servidor já marcou).
        void navigate({ to: "/agenda" });
      })
      .catch(() => toast.error("Este convite não vale mais. Peça um link novo a quem te convidou."));
  }, [queryClient, setActive, navigate]);
  return null;
}
