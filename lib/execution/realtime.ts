import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface ExecutionUpdate {
  execution_id: string;
  status: "queued" | "running" | "success" | "failed";
  current_step?: string;
  progress?: number;
  error?: string;
  result?: any;
}

export interface StepUpdate {
  step_id: string;
  execution_id: string;
  node_id: string;
  status: "pending" | "running" | "success" | "failed";
  output?: any;
  error?: string;
}

export class ExecutionRealtimeSubscription {
  private channel: RealtimeChannel | null = null;
  private supabase = createClient();

  subscribeToExecution(
    executionId: string,
    callbacks: {
      onExecutionUpdate?: (update: ExecutionUpdate) => void;
      onStepUpdate?: (update: StepUpdate) => void;
      onComplete?: (result: any) => void;
      onError?: (error: string) => void;
    }
  ) {
    // Subscribe to execution status changes
    this.channel = this.supabase
      .channel(`execution:${executionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workflow_executions",
          filter: `id=eq.${executionId}`,
        },
        (payload) => {
          const execution = payload.new as any;
          const update: ExecutionUpdate = {
            execution_id: execution.id,
            status: execution.status,
            error: execution.error_message,
            result: execution.result,
          };

          callbacks.onExecutionUpdate?.(update);

          if (execution.status === "success") {
            callbacks.onComplete?.(execution.result);
          } else if (execution.status === "failed") {
            callbacks.onError?.(execution.error_message);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workflow_execution_steps",
          filter: `execution_id=eq.${executionId}`,
        },
        (payload) => {
          const step = payload.new as any;
          const update: StepUpdate = {
            step_id: step.id,
            execution_id: step.execution_id,
            node_id: step.node_id,
            status: step.status,
            output: step.output_data,
            error: step.error_message,
          };

          callbacks.onStepUpdate?.(update);
        }
      )
      .subscribe();

    return () => this.unsubscribe();
  }

  subscribeToAllExecutions(workflowId: string, callback: (execution: any) => void) {
    this.channel = this.supabase
      .channel(`workflow:${workflowId}:executions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflow_executions",
          filter: `workflow_id=eq.${workflowId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => this.unsubscribe();
  }

  unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// Singleton instance
let realtimeInstance: ExecutionRealtimeSubscription | null = null;

export function getRealtimeSubscription() {
  if (!realtimeInstance) {
    realtimeInstance = new ExecutionRealtimeSubscription();
  }
  return realtimeInstance;
}
