import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import { useFlowStore } from "../store/flow.store";

export function ActionNode({ id, data }: NodeProps) {
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div
      className={`bg-panel border border-info px-4 py-3 rounded-xl min-w-50 shadow-lg shadow-info/5 transition-all duration-500 ${isActive
        ? "ring-4 ring-info shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-105 z-50"
        : ""
        }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!bg-info"
      />

      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} className="text-info" />
        <span className="text-[10px] font-bold text-info uppercase tracking-wider">
          Ação
        </span>
      </div>

      <div className="text-sm font-medium text-text-primary">
        {data.label as string}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!bg-info"
      />
    </div>
  );
}
