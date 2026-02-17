import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import { useFlowStore } from "../store/flow.store";

export function ActionNode({ id, data }: NodeProps) {
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div
      className={`bg-panel border border-info px-4 py-3 rounded-xl min-w-50 shadow-lg shadow-info/5 transition-all duration-500 ${
        isActive
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

      <div className="text-sm font-bold text-text-primary mb-2">
        {data.label as string}
      </div>

      {(data.method || data.url) && (
        <div className="flex flex-col gap-1 border-t border-info/20 pt-2 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black bg-info/20 text-info px-1.5 py-0.5 rounded border border-info/30">
              {String(data.method || "GET")}
            </span>
            <span className="text-[10px] text-text-secondary truncate font-mono">
              {String(data.url || "no-url")}
            </span>
          </div>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!bg-info"
      />
    </div>
  );
}
