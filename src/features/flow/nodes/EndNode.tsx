import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Square } from "lucide-react";
import { useFlowStore } from "../store/flow.store";

export function EndNode({ id }: NodeProps) {
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div
      className={`bg-danger/10 border-2 border-danger/50 p-3 rounded-xl flex items-center justify-center shadow-lg shadow-danger/10 group relative min-w-12 min-h-12 transition-all duration-500 ${isActive ? "ring-4 ring-danger scale-110 z-50" : ""
        }`}
    >
      <Square size={18} className="text-danger fill-danger" />

      <div className="absolute top-full mt-2 px-2 py-1 bg-danger text-text-primary text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        FIM DO FLUXO
      </div>

      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="w-3 h-3 !bg-danger border-2 border-bg-start"
      />
    </div>
  );
}
