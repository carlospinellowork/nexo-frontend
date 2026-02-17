import { CheckCircle2, Circle } from "lucide-react";
import { useFlowStore } from "../store/flow.store";

export function ExecutionPath() {
  const { simulationLogs, activeNodeId, nodes } = useFlowStore();

  const executedNodeIds = Array.from(
    new Set(
      simulationLogs.filter((log) => log.nodeId).map((log) => log.nodeId!),
    ),
  );

  const currentNode = nodes.find((n) => n.id === activeNodeId);

  return (
    <div className="w-80 flex flex-col gap-6 p-6 bg-panel/20 border border-border-ui/50 rounded-3xl h-full shadow-inner">
      <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-2 opacity-80">
        Caminho de Execução
      </h3>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {executedNodeIds.map((nodeId, index) => {
          const node = nodes.find((n) => n.id === nodeId);
          if (!node) return null;

          return (
            <div
              key={nodeId}
              className="flex items-center gap-4 group animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary z-10 border border-primary/30">
                  <CheckCircle2 size={16} />
                </div>
                {(index < executedNodeIds.length - 1 || activeNodeId) && (
                  <div className="absolute top-8 w-px h-6 bg-primary/20" />
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary line-clamp-1">
                    {node.data.label as string}
                  </span>
                  <span className="text-[9px] font-black text-text-secondary uppercase px-1.5 py-0.5 bg-white/5 rounded border border-border-ui/50">
                    {node.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {activeNodeId &&
          currentNode &&
          !executedNodeIds.includes(activeNodeId) && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white z-10 shadow-[0_0_15px_var(--color-primary)] animate-pulse">
                  <span className="text-[10px] font-black">
                    {executedNodeIds.length + 1}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">
                    {currentNode.data.label as string}
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase ml-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                    Running
                  </span>
                </div>
              </div>
            </div>
          )}

        {!activeNodeId &&
          executedNodeIds.length > 0 &&
          simulationLogs[simulationLogs.length - 1].message !==
            "Fluxo Finalizado" && (
            <div className="flex items-center gap-4 opacity-30">
              <div className="w-8 h-8 rounded-full border border-dashed border-text-secondary flex items-center justify-center">
                <Circle size={14} />
              </div>
              <span className="text-xs font-medium text-text-secondary italic">
                Próximo passo...
              </span>
            </div>
          )}
      </div>

      <div className="pt-6 border-t border-border-ui/50 mt-auto space-y-3">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-text-secondary font-bold uppercase tracking-tighter">
            Sessão iniciada:
          </span>
          <span className="text-text-primary font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-text-secondary font-bold uppercase tracking-tighter">
            ID da Execução:
          </span>
          <span className="text-text-primary font-mono">
            #flw_{Math.random().toString(36).substring(7)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-text-secondary font-bold uppercase tracking-tighter">
            Nodes processados:
          </span>
          <span className="text-text-primary font-mono">
            {executedNodeIds.length}
          </span>
        </div>
      </div>
    </div>
  );
}
