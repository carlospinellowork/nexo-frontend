import type { NodeTypes } from "@xyflow/react";
import { NODE_TYPES } from "../contract";
import { BlockNode } from "./BlockNode";

/** Todos os tipos usam o mesmo card; o visual vem do catálogo (catalog.ts). */
export const nodeTypes: NodeTypes = Object.fromEntries(NODE_TYPES.map((t) => [t, BlockNode]));
