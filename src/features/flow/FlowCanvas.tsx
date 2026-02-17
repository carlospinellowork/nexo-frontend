import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useReactFlow } from "@xyflow/react";
import React, { useCallback } from "react";
import { useFlowExecutor } from "./engine/flow.executor";

import { ActionNode } from "./nodes/ActionNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { MessageNode } from "./nodes/MessageNode";

import { NodePropertiesPanel } from "./components/NodePropertiesPanel";
import { NodeToolbar } from "./components/NodeToolbar";
import { EndNode } from "./nodes/EndNode";
import { StartNode } from "./nodes/StartNode";
import { useFlowStore } from "./store/flow.store";

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  action: ActionNode,
  condition: ConditionNode,
  end: EndNode,
};

function FlowCanvasContent() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
  } = useFlowStore();

  const { screenToFlowPosition } = useReactFlow();

  useFlowExecutor();

  const defaultEdgeOptions = {
    style: { strokeWidth: 2, stroke: "#94a3b8" },
    type: "smoothstep",
    animated: true,
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Math.random().toString(36).substring(2, 9)}`,
        type,
        position,
        data: { label: `Novo ${type}` },
      } as Node;

      addNode(newNode);
    },
    [addNode, screenToFlowPosition],
  );

  return (
    <div
      className="h-full w-full bg-linear-to-br from-bg-bg-start to-bg-bg-end"
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDragOver={onDragOver}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap
          style={{
            background: "var(--color-panel)",
            borderRadius: "12px",
          }}
          maskColor="rgba(0,0,0,0.3)"
          nodeColor="#334155"
        />
      </ReactFlow>

      <NodePropertiesPanel />
      <NodeToolbar />
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent />
    </ReactFlowProvider>
  );
}
