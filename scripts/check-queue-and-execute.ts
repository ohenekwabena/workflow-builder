import { supabaseAdmin } from "../lib/supabase/server";
import { getQueueLength } from "../lib/queue";
import { processWorkflowQueue } from "../lib/queue/worker";

async function checkAndExecute() {
  console.log("=== Queue Status ===");
  const queueLength = await getQueueLength();
  console.log(`Items in queue: ${queueLength}`);

  if (queueLength > 0) {
    console.log("\n=== Processing Queue ===");
    await processWorkflowQueue();
  } else {
    console.log("\nNo items in queue");

    // Check recent executions
    const { data: executions } = await supabaseAdmin()
      .from("workflow_executions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    console.log("\n=== Recent Executions ===");
    executions?.forEach((exec: any) => {
      console.log(`\nID: ${exec.id}`);
      console.log(`Status: ${exec.status}`);
      console.log(`Trigger: ${exec.trigger_type}`);
      console.log(`Created: ${exec.created_at}`);
      console.log(`Error: ${exec.error_message || "none"}`);
    });
  }
}

checkAndExecute().catch(console.error);
