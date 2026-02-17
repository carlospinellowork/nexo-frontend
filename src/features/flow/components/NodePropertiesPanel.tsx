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
            Título do Bloco
          </label>
          <input
            type="text"
            value={selectedNode.data.label as string}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { label: e.target.value })
            }
            className="w-full bg-bg-start border border-border-ui rounded-xl p-3 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        {selectedNode.type === "message" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
              Conteúdo da Mensagem
            </label>
            <textarea
              value={(selectedNode.data.content as string) || ""}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { content: e.target.value })
              }
              className="w-full bg-bg-start border border-border-ui rounded-xl p-3 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-32"
              placeholder="O que o bot deve dizer?"
            />
          </div>
        )}

        {selectedNode.type === "action" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                URL da API (Webhook)
              </label>
              <input
                type="text"
                value={(selectedNode.data.url as string) || ""}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { url: e.target.value })
                }
                className="w-full bg-bg-start border border-border-ui rounded-xl p-3 text-sm text-text-primary focus:border-primary outline-none transition-all"
                placeholder="https://sua-api.com/endpoint"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Método HTTP
              </label>
              <select
                value={(selectedNode.data.method as string) || "GET"}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { method: e.target.value })
                }
                className="w-full bg-bg-start border border-border-ui rounded-xl p-3 text-sm text-text-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
          </div>
        )}

        {selectedNode.type === "condition" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
              Pergunta/Critério
            </label>
            <textarea
              value={(selectedNode.data.criteria as string) || ""}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { criteria: e.target.value })
              }
              className="w-full bg-bg-start border border-border-ui rounded-xl p-3 text-sm text-text-primary focus:border-primary outline-none transition-all resize-none h-24"
              placeholder="Ex: O cliente quer falar com atendente?"
            />
          </div>
        )}

        <div className="p-4 bg-white/5 rounded-xl border border-white/5 mt-auto">
          <span className="text-[10px] text-text-secondary block mb-1 uppercase font-bold tracking-tight">
            Status do Nó: <span className="text-primary italic">Pronto</span>
          </span>
          <p className="text-[10px] text-text-secondary leading-tight opacity-60">
            As alterações são salvas automaticamente no fluxo local.
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
