import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase/server";

async function main() {
  const { data: execution, error } = await supabaseAdmin()
    .from("workflow_executions")
    .select(
      `
      *,
      workflow_execution_steps (
        *
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching execution:", error);
    return;
  }

  console.log("\n🔍 Latest Execution:");
  console.log(`  ID: ${execution.id}`);
  console.log(`  Status: ${execution.status}`);
  console.log(`  Created: ${execution.created_at}`);
  console.log(`  Completed: ${execution.completed_at}`);
  console.log(`  Error: ${execution.error_message || "None"}`);

  console.log(`\n📋 Execution Steps (${execution.workflow_execution_steps.length}):`);

  execution.workflow_execution_steps
    .sort((a: any, b: any) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    .forEach((step: any, index: number) => {
      console.log(`\n  Step ${index + 1}: ${step.node_type}`);
      console.log(`    Status: ${step.status}`);
      console.log(`    Duration: ${step.duration_ms}ms`);
      if (step.error_message) {
        console.log(`    Error: ${step.error_message}`);
      }
      if (step.output_data) {
        console.log(`    Output:`, JSON.stringify(step.output_data, null, 2));
      }
    });
}

main();
