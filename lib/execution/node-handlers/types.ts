export interface NodeExecutionContext {
  userId: string;
  executionId: string;
  workflowId: string;
  previousOutputs: Record<string, any>;
  integrations: Record<string, any>;
}

export interface NodeHandler {
  type: string;
  execute: (config: any, input: any, context: NodeExecutionContext) => Promise<any>;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
}
