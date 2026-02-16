import { GitBranch, MessageSquare, Square, Zap } from "lucide-react";
import type { DragEvent } from "react";

export function NodeToolbar() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-2 p-2 bg-panel/80 backdrop-blur-md border border-border-ui rounded-2xl shadow-2xl">
        <ToolbarItem
          icon={<MessageSquare size={20} />}
          label="Mensagem"
          onDragStart={(e) => onDragStart(e, "message")}
        />
        <ToolbarItem
          icon={<Zap size={20} />}
          label="Ação"
          onDragStart={(e) => onDragStart(e, "action")}
        />
        <ToolbarItem
          icon={<GitBranch size={20} />}
          label="Condição"
          onDragStart={(e) => onDragStart(e, "condition")}
        />
        <ToolbarItem
          icon={<Square size={20} />}
          label="Fim"
          onDragStart={(e) => onDragStart(e, "end")}
        />
      </div>
    </div>
  );
}

function ToolbarItem({
  icon,
  label,
  onDragStart,
}: {
  icon: React.ReactNode;
  label: string;
  onDragStart: (event: DragEvent) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="p-3 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-grab active:cursor-grabbing group relative"
    >
      <div className="group-hover:scale-110 transition-transform">{icon}</div>

      <div className="absolute right-full mr-3 px-2 py-1 bg-text-primary text-bg-start text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
