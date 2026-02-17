import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Filter } from "lucide-react";
import { useFlowStore } from "../store/flow.store";

export function ConditionNode({ id, data }: NodeProps) {
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div
      className={`bg-panel border border-warning px-4 py-3 rounded-xl min-w-55 shadow-lg shadow-warning/5 transition-all duration-500 ${
        isActive
          ? "ring-4 ring-warning shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105 z-50"
          : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!bg-warning"
      />

      <div className="flex items-center gap-2 mb-2">
        <Filter size={14} className="text-warning" />
        <span className="text-[10px] font-bold text-warning uppercase tracking-wider">
          Condição
        </span>
      </div>

      <div className="text-sm font-bold text-text-primary mb-1">
        {data.label as string}
      </div>
      {data.criteria && (
        <div className="text-[11px] text-text-secondary line-clamp-2 italic leading-tight mb-2 opacity-80">
          "{String(data.criteria)}"
        </div>
      )}
      <div className="flex justify-between items-center mt-2 -mx-2">
        <div className="relative flex flex-col items-start -translate-x-2">
          <span className="text-[9px] font-bold text-primary mb-1 ml-2">
            SIM
          </span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: "20%", backgroundColor: "var(--color-primary)" }}
          />
        </div>
        <div className="relative flex flex-col items-end -translate-x-2">
          <span className="text-[9px] font-bold text-danger mb-1 mr-2">
            NÃO
          </span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ left: "80%", backgroundColor: "var(--color-danger)" }}
          />
        </div>
      </div>
    </div>
  );
}
