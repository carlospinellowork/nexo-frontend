import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useFlowStore } from "../store/flow.store";

export function MessageNode({ id, data }: NodeProps) {
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div
      className={`bg-panel border border-border-ui p-4 rounded-xl min-w-50 transition-all duration-500 ${isActive
        ? "ring-4 ring-primary shadow-[0_0_30px_rgba(20,184,166,0.4)] scale-105 z-50"
        : ""
        }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="w-3 h-3 bg-primary"
      />

      <div className="text-xs font-bold text-primary mb-1 uppercase">
        {data.isStart ? "Fluxo inicial" : "Mensagem"}
      </div>
      <div className="text-sm text-text-primary">{data.label as string}</div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="w-3 h-3 bg-primary"
      />
    </div>
  );
}
