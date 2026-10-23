import { useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../../api/instance";
import { usePostWorkspace } from "../../../api/mutations/usePostWorkspace";
import { useGetWorkspaces } from "../../../api/queries/useGetWorkspaces";
import { PromptDialog } from "../../../shared/components/ui/PromptDialog";
import { toast } from "../../../shared/components/ui/toast-store";
import { useWorkspaceStore } from "../store/workspace-store";

const ROLE_LABEL = { OWNER: "Dono", ADMIN: "Admin", MEMBER: "Membro" } as const;

export function WorkspaceSelector() {
  const queryClient = useQueryClient();
  const { data: workspaces, isLoading } = useGetWorkspaces();
  const { mutateAsync: createWorkspace, isPending: isCreating } = usePostWorkspace();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Garante um workspace ativo válido (ex.: primeiro login ou workspace removido).
  useEffect(() => {
    if (workspaces && !workspaces.some((w) => w.id === activeWorkspaceId)) {
      setActiveWorkspaceId(workspaces[0]?.id ?? null);
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspaceId]);

  const select = (id: string) => {
    setActiveWorkspaceId(id);
    setIsOpen(false);
    // Dados do workspace anterior não podem aparecer no novo.
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "workspaces" });
  };

  const handleCreate = async (name: string) => {
    try {
      const created = await createWorkspace(name);
      setCreating(false);
      select(created.id);
      toast.success(`Workspace "${created.name}" criado.`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const active = workspaces?.find((w) => w.id === activeWorkspaceId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 rounded-2xl border border-border-ui bg-panel p-3 text-left shadow-card transition-colors hover:bg-panel-hover"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Building2 size={18} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[14px] font-semibold text-text-primary">{isLoading ? "Carregando..." : active?.name ?? "Nenhum"}</span>
          <span className="text-[12px] text-text-secondary">{active ? ROLE_LABEL[active.role] : "Workspace"}</span>
        </span>
        <ChevronsUpDown size={16} className="shrink-0 text-text-secondary" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-full origin-bottom overflow-hidden rounded-2xl border border-border-ui bg-panel shadow-float"
          >
            <div className="max-h-56 overflow-y-auto p-1.5">
              {workspaces?.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => select(ws.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-text-primary transition-colors hover:bg-panel-hover"
                >
                  <Building2 size={16} className="text-text-secondary" />
                  <span className="flex-1 truncate text-left">{ws.name}</span>
                  {ws.id === activeWorkspaceId && <Check size={16} className="text-primary" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setCreating(true);
              }}
              className="flex w-full items-center gap-2.5 border-t border-border-ui px-4 py-3 text-[14px] font-semibold text-primary-strong transition-colors hover:bg-primary/8"
            >
              <Plus size={16} />
              Novo workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PromptDialog
        open={creating}
        title="Novo workspace"
        label="Nome da empresa ou cliente"
        placeholder="Ex.: Clínica Sorriso"
        loading={isCreating}
        onConfirm={handleCreate}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
