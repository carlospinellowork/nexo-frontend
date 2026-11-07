import { useEffect } from "react";
import { api } from "../../api/instance";
import { useWorkspaceStore } from "../workspaces/store/workspace-store";
import { clearSignupSource, storedSignupSource } from "./signupSource";

/** Na parte logada: manda uma vez como a conta chegou (selo, reserva, indicação) e apaga do aparelho. */
export function SendSignupSource() {
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  useEffect(() => {
    const source = workspaceId ? storedSignupSource() : null;
    if (!source) return;
    // Apaga mesmo se falhar: o servidor só aceita em conta nova, e não vale insistir.
    void api.post("/me/source", source).catch(() => undefined).finally(clearSignupSource);
  }, [workspaceId]);
  return null;
}
