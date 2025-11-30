import { supabaseAdmin } from "../supabase/server";
import { NODE_HANDLERS } from "./node-handlers";
import { NodeExecutionContext } from "./node-handlers/types";

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    nodeType: string;
    config: Record<string, any>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export class WorkflowExecutionEngine {
  private executionId: string;
  private workflowId: string;
  private userId: string;
  private nodes: WorkflowNode[];
  private edges: WorkflowEdge[];
  private nodeOutputs: Record<string, any> = {};
  private integrations: Record<string, any> = {};

  constructor(executionId: string, workflowId: string, userId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    this.executionId = executionId;
    this.workflowId = workflowId;
    this.userId = userId;
    this.nodes = nodes;
    this.edges = edges;
  }

  async execute(triggerInput: any = {}) {
    try {
      // Update execution status to running
      await this.updateExecutionStatus("running");

      // Load user integrations
      await this.loadIntegrations();

      // Get execution order (topological sort)
      const executionOrder = this.getExecutionOrder();

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        await this.executeNode(nodeId, triggerInput);
      }

      // Mark as success
      await this.updateExecutionStatus("success");

      return {
        success: true,
        outputs: this.nodeOutputs,
      };
    } catch (error: any) {
      console.error("Workflow execution failed:", error);

      await this.updateExecutionStatus("failed", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async executeNode(nodeId: string, triggerInput: any) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    console.log(`\n=== Executing Node ${nodeId} ===`);
    console.log("Node type:", node.data.nodeType);
    console.log("Node config:", JSON.stringify(node.data.config));

    const startTime = Date.now();

    // Create execution step record
    const { data: step } = await supabaseAdmin()
      .from("workflow_execution_steps")
      .insert({
        execution_id: this.executionId,
        node_id: nodeId,
        node_type: node.data.nodeType,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    try {
      // Get input from previous nodes
      const input = this.getNodeInput(nodeId, triggerInput);

      console.log("Node input:", JSON.stringify(input));

      // Find handler for this node type
      const handler = NODE_HANDLERS[node.data.nodeType];
      if (!handler) {
        throw new Error(`No handler found for node type: ${node.data.nodeType}`);
      }

      // Execute node
      const context: NodeExecutionContext = {
        userId: this.userId,
        executionId: this.executionId,
        workflowId: this.workflowId,
        previousOutputs: this.nodeOutputs,
        integrations: this.integrations,
      };

      const output = await handler.execute(node.data.config, input, context);

      console.log("Node output:", JSON.stringify(output));

      // Store output for next nodes
      this.nodeOutputs[nodeId] = output;

      const duration = Date.now() - startTime;

      // Update step as success
      await supabaseAdmin()
        .from("workflow_execution_steps")
        .update({
          status: "success",
          output_data: output,
          input_data: input,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq("id", step.id);
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Update step as failed
      await supabaseAdmin()
        .from("workflow_execution_steps")
        .update({
          status: "failed",
          error_message: error.message,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq("id", step.id);

      throw error;
    }
  }

  private getNodeInput(nodeId: string, triggerInput: any): any {
    // Find parent nodes
    const parentEdges = this.edges.filter((e) => e.target === nodeId);

    if (parentEdges.length === 0) {
      // This is a trigger node
      return triggerInput;
    }

    // Merge outputs from all parent nodes
    const input: any = {};
    for (const edge of parentEdges) {
      const parentOutput = this.nodeOutputs[edge.source];
      if (parentOutput) {
        Object.assign(input, parentOutput);
      }
    }

    return input;
  }

  private getExecutionOrder(): string[] {
    // Simple topological sort - start from triggers and traverse to children
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      order.push(nodeId);

      // Visit children nodes (nodes that depend on this one)
      const childEdges = this.edges.filter((e) => e.source === nodeId);

      for (const edge of childEdges) {
        visit(edge.target);
      }
    };

    // Start from nodes with no incoming edges (triggers)
    const triggerNodes = this.nodes.filter((node) => !this.edges.some((e) => e.target === node.id));

    for (const node of triggerNodes) {
      visit(node.id);
    }

    return order;
  }

  private async loadIntegrations() {
    const { data } = await supabaseAdmin()
      .from("integration_connections")
      .select("*")
      .eq("user_id", this.userId)
      .eq("is_active", true);

    if (data) {
      for (const integration of data) {
        this.integrations[integration.provider] = integration;
      }
    }
  }

  private async updateExecutionStatus(status: "queued" | "running" | "success" | "failed", errorMessage?: string) {
    const updateData: any = { status };

    if (status === "success" || status === "failed") {
      updateData.completed_at = new Date().toISOString();

      // Calculate total duration from all steps
      const { data: steps } = await supabaseAdmin()
        .from("workflow_execution_steps")
        .select("duration_ms")
        .eq("execution_id", this.executionId);

      if (steps && steps.length > 0) {
        const totalDuration = steps.reduce((sum, step) => sum + (step.duration_ms || 0), 0);
        updateData.duration_ms = totalDuration;
      }
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await supabaseAdmin().from("workflow_executions").update(updateData).eq("id", this.executionId);
  }
}

// Helper function to execute a workflow
export async function executeWorkflow({
  executionId,
  workflowId,
  userId,
  nodes,
  edges,
  triggerInput,
}: {
  executionId: string;
  workflowId: string;
  userId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggerInput: any;
}) {
  const engine = new WorkflowExecutionEngine(executionId, workflowId, userId, nodes, edges);
  return await engine.execute(triggerInput);
}
