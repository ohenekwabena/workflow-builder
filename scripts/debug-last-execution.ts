import { supabaseAdmin } from "../lib/supabase/server";

async function checkLastExecution() {
  // Get most recent execution
  const { data: executions } = await supabaseAdmin()
    .from("workflow_executions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!executions || executions.length === 0) {
    console.log("No executions found");
    return;
  }

  const execution = executions[0];
  console.log("\n=== Last Execution ===");
  console.log("ID:", execution.id);
  console.log("Status:", execution.status);
  console.log("Trigger:", execution.trigger_type);
  console.log("Created:", execution.created_at);
  console.log("Error:", execution.error_message || "none");

  // Get execution steps
  const { data: steps } = await supabaseAdmin()
    .from("workflow_execution_steps")
    .select("*")
    .eq("execution_id", execution.id)
    .order("started_at", { ascending: true });

  console.log("\n=== Execution Steps ===");
  steps?.forEach((step: any) => {
    console.log(`\n--- Step ${step.node_type} ---`);
    console.log("Status:", step.status);
    console.log("Duration:", step.duration_ms, "ms");
    console.log("Input:", JSON.stringify(step.input_data, null, 2));
    console.log("Output:", JSON.stringify(step.output_data, null, 2));
    if (step.error_message) {
      console.log("Error:", step.error_message);
    }
  });
}

checkLastExecution().catch(console.error);
