import { Node, Edge } from "reactflow";

export type NodeCategory = "trigger" | "data" | "action" | "logic";

export interface NodeTypeDefinition {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  config: {
    fields: ConfigField[];
  };
}

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox" | "email";
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface WorkflowNode extends Node {
  data: {
    label: string;
    nodeType: string;
    config: Record<string, any>;
    category: NodeCategory;
    icon?: string;
    color?: string;
  };
}

export type WorkflowEdge = Edge;

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  is_active: boolean;
  trigger_config?: any;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: "queued" | "running" | "success" | "failed";
  trigger_type: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  duration_ms?: number;
}
