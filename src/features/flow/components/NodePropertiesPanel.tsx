import { X } from "lucide-react";
import { useFlowStore } from "../store/flow.store";

export function NodePropertiesPanel() {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeData,
    deleteNode,
  } = useFlowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNodeId || !selectedNode) return null;

  return (
    <div className="absolute left-6 top-24 bottom-24 w-80 bg-panel/80 backdrop-blur-md border border-border-ui rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="p-4 border-b border-border-ui flex items-center justify-between bg-white/5">
        <div>
          <h3 className="text-sm font-bold text-text-primary capitalize">
            Configurar {selectedNode.type}
          </h3>
          <p className="text-[10px] text-text-secondary font-mono">
            {/* ID: {selectedNode.id} */}
          </p>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1.5 hover:bg-white/10 rounded-lg text-text-secondary transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
            Texto do Bloco
          </label>
          <textarea
            value={selectedNode.data.label as string}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { label: e.target.value })
            }
            className="w-full bg-bg-start border border-border-ui rounded-xl p-3 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-24"
            placeholder="Digite aqui..."
          />
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[10px] text-text-secondary block mb-1 uppercase font-bold">
            Dica
          </span>
          <p className="text-xs text-text-secondary leading-relaxed">
            Este bloco é do tipo{" "}
            <span className="text-primary font-bold">{selectedNode.type}</span>.
            As mudanças feitas aqui são salvas automaticamente no fluxo.
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-border-ui bg-white/5 flex gap-2">
        <button
          className="flex-1 py-2 text-xs font-bold bg-white/5 hover:bg-danger/10 hover:text-danger rounded-lg transition-all"
          onClick={() => {
            deleteNode(selectedNode.id);
          }}
        >
          Deletar Bloco
        </button>
      </div>
    </div>
  );
}
