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
  console.log(`  Workflow ID: ${job.workflowId}`);
  console.log(`  Nodes: ${job.nodes.length}`);
  console.log(`  Edges: ${job.edges.length}`);

  try {
    const engine = new WorkflowExecutionEngine(job.executionId, job.workflowId, job.userId, job.nodes, job.edges);

    const result = await engine.execute(job.triggerInput);

    if (result.success) {
      console.log(`✅ Workflow execution completed successfully: ${job.executionId}`);
    } else {
      console.log(`❌ Workflow execution failed: ${job.executionId}`);
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.error(`❌ Workflow execution failed with exception: ${job.executionId}`);
    console.error(error);
  }
}
