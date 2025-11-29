import { dequeueWorkflow } from "./index";
import { WorkflowExecutionEngine } from "../execution/engine";

export async function processWorkflowQueue() {
  console.log("Checking for queued workflows...");

  const job = await dequeueWorkflow();

  if (!job) {
    console.log("No workflows in queue");
    return;
  }

  console.log(`Processing workflow execution: ${job.executionId}`);

  try {
    const engine = new WorkflowExecutionEngine(job.executionId, job.workflowId, job.userId, job.nodes, job.edges);

    await engine.execute(job.triggerInput);

    console.log(`✅ Workflow execution completed: ${job.executionId}`);
  } catch (error) {
    console.error(`❌ Workflow execution failed: ${job.executionId}`, error);
  }
}
