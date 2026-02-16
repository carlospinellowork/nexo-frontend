import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { useFlowStore } from "../store/flow.store";

export function StartNode({ id, data }: NodeProps) {
  const activeNodeId = useFlowStore((state) => state.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div
      className={`bg-primary/20 border-2 border-primary p-3 gap-2 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group relative min-w-12 min-h-12 transition-all duration-500 ${isActive ? "ring-4 ring-primary scale-110 z-50" : ""
        }`}
    >
      <Play size={20} className="text-primary fill-primary" />

      <div className="absolute bottom-full mb-2 px-2 py-1 bg-primary text-bg-start text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        INÍCIO DO FLUXO
      </div>

      <div className="text-xs font-bold text-primary mb-1 uppercase">
        {data.label as string}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="w-3 h-3 !bg-primary border-2 border-bg-start"
      />
    </div>
  );
}
