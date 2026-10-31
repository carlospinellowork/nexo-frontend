import { useGetWorkspaces } from "../../api/queries/useGetWorkspaces";
import { useWorkspaceStore } from "../../features/workspaces/store/workspace-store";

/**
 * Papel do usuário no workspace ativo. `canManage` é Admin ou Dono: só eles criam, editam e apagam
 * o que vai a público (o backend responde 403 para Membro de qualquer jeito).
 */
export function useWorkspaceRole() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: workspaces } = useGetWorkspaces();
  const role = workspaces?.find((w) => w.id === workspaceId)?.role;
  return { role, canManage: role === "OWNER" || role === "ADMIN" };
}
