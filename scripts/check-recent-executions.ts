import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase/server";

async function main() {
  const { data: executions, error } = await supabaseAdmin()
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
    .limit(5);

  if (error) {
    console.error("Error fetching executions:", error);
    return;
  }

  console.log("\n🔍 Recent Executions:\n");

  executions.forEach((execution, idx) => {
    console.log(`${idx + 1}. Execution ID: ${execution.id}`);
    console.log(`   Status: ${execution.status}`);
    console.log(`   Created: ${execution.created_at}`);
    console.log(`   Steps: ${execution.workflow_execution_steps.length}`);

    if (execution.error_message) {
      console.log(`   Error: ${execution.error_message}`);
    }

    if (execution.workflow_execution_steps.length > 0) {
      execution.workflow_execution_steps
        .sort((a: any, b: any) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
        .forEach((step: any, index: number) => {
          console.log(`     Step ${index + 1}: ${step.node_type} - ${step.status}`);
        });
    }
    console.log("");
  });
}

main();
