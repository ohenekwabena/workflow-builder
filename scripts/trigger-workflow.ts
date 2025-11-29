import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase/server";
import { enqueueWorkflow } from "../lib/queue";

async function main() {
  const workflowId = process.argv[2] || "0bfe61fc-343c-4107-9a80-162d214e31c6";

  console.log("🚀 Manually triggering workflow execution...\n");
  console.log(`Workflow ID: ${workflowId}\n`);

  // Get workflow
  const { data: workflow, error } = await supabaseAdmin().from("workflows").select("*").eq("id", workflowId).single();

  if (error || !workflow) {
    console.error("❌ Workflow not found:", error);
    return;
  }

  console.log(`📋 Workflow: ${workflow.name}`);
  console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
  console.log(`   Edges: ${workflow.edges?.length || 0}`);
  console.log(`   Active: ${workflow.is_active}\n`);

  // Create execution
  const { data: execution, error: execError } = await supabaseAdmin()
    .from("workflow_executions")
    .insert({
      workflow_id: workflow.id,
      user_id: workflow.user_id,
      status: "queued",
      trigger_type: "manual",
    })
    .select()
    .single();

  if (execError) {
    console.error("❌ Failed to create execution:", execError);
    return;
  }

  console.log(`✅ Created execution: ${execution.id}`);

  // Enqueue
  await enqueueWorkflow({
    executionId: execution.id,
    workflowId: workflow.id,
    userId: workflow.user_id,
    nodes: workflow.nodes,
    edges: workflow.edges,
    triggerInput: {
      trigger_type: "manual",
      triggered_at: new Date().toISOString(),
    },
  });

  console.log("✅ Enqueued for processing\n");
  console.log("Run 'npm run process-queue' to execute the workflow");
}

main();
