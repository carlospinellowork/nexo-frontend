import { useEffect } from "react";
import { useGetWorkspaces } from "../../api/queries/useGetWorkspaces";
import { useWorkspaceStore } from "./store/workspace-store";

/**
 * Garante um espaço ativo válido (primeiro login ou espaço removido). Mora no layout, que está sempre na tela:
 * tudo do painel espera este id, e o seletor de empresa só existe com o menu da conta aberto.
 */
export function useEnsureActiveWorkspace() {
  const { data: workspaces } = useGetWorkspaces();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  useEffect(() => {
    if (workspaces && !workspaces.some((w) => w.id === activeWorkspaceId)) setActiveWorkspaceId(workspaces[0]?.id ?? null);
  }, [workspaces, activeWorkspaceId, setActiveWorkspaceId]);
}
