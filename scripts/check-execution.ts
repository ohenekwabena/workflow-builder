import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExecution(executionId: string) {
  console.log(`🔍 Checking execution: ${executionId}\n`);

  // Get execution
  const { data: execution, error: execError } = await supabase
    .from("workflow_executions")
    .select("*")
    .eq("id", executionId)
    .single();

  if (execError) {
    console.error("Error fetching execution:", execError);
    return;
  }

  console.log("📋 Execution Details:");
  console.log(`  Status: ${execution.status}`);
  console.log(`  Workflow ID: ${execution.workflow_id}`);
  console.log(`  Started: ${execution.started_at || "N/A"}`);
  console.log(`  Completed: ${execution.completed_at || "N/A"}`);
  console.log(`  Error: ${execution.error_message || "None"}`);

  // Get steps
  const { data: steps, error: stepsError } = await supabase
    .from("workflow_execution_steps")
    .select("*")
    .eq("execution_id", executionId)
    .order("created_at", { ascending: true });

  if (stepsError) {
    console.error("Error fetching steps:", stepsError);
    return;
  }

  console.log(`\n📝 Execution Steps (${steps?.length || 0}):`);

  if (!steps || steps.length === 0) {
    console.log("  ⚠️  No steps found!");
  } else {
    steps.forEach((step, index) => {
      console.log(`\n  Step ${index + 1}: ${step.node_type}`);
      console.log(`    Node ID: ${step.node_id}`);
      console.log(`    Status: ${step.status}`);
      console.log(`    Duration: ${step.duration_ms}ms`);
      console.log(`    Input: ${JSON.stringify(step.input_data)?.slice(0, 100)}...`);
      console.log(`    Output: ${JSON.stringify(step.output_data)?.slice(0, 100)}...`);
      if (step.error_message) {
        console.log(`    Error: ${step.error_message}`);
      }
    });
  }
}

// Get execution ID from command line or use the latest
const executionId = process.argv[2] || "10115a0b-b962-4dd2-a1f4-3aa7a1c51108";
checkExecution(executionId).catch(console.error);
