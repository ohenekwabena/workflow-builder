import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping from old dash format to new colon format
const nodeTypeMappings: Record<string, string> = {
  "trigger-schedule": "trigger:schedule",
  "trigger-webhook": "trigger:webhook",
  "data-weather": "data:weather",
  "data-github": "data:github",
  "action-email": "action:email",
  "action-http": "action:http_request",
  "logic-transform": "logic:transform",
  "logic-ai": "logic:ai_summarizer",
};

async function fixWorkflowNodeTypes() {
  console.log("🔍 Fetching all workflows...");

  const { data: workflows, error } = await supabase.from("workflows").select("*");

  if (error) {
    console.error("Error fetching workflows:", error);
    return;
  }

  if (!workflows || workflows.length === 0) {
    console.log("No workflows found.");
    return;
  }

  console.log(`Found ${workflows.length} workflow(s) to check.`);

  for (const workflow of workflows) {
    console.log(`\nProcessing workflow: ${workflow.name} (${workflow.id})`);

    let nodes = workflow.nodes;
    let updated = false;

    // Update node types in nodes array
    nodes = nodes.map((node: any) => {
      const oldNodeType = node.data?.nodeType;
      if (oldNodeType && nodeTypeMappings[oldNodeType]) {
        console.log(`  ✏️  Updating node "${node.data.label}": ${oldNodeType} → ${nodeTypeMappings[oldNodeType]}`);
        updated = true;
        return {
          ...node,
          data: {
            ...node.data,
            nodeType: nodeTypeMappings[oldNodeType],
          },
        };
      }
      return node;
    });

    if (updated) {
      console.log(`  💾 Saving updated workflow...`);
      const { error: updateError } = await supabase.from("workflows").update({ nodes }).eq("id", workflow.id);

      if (updateError) {
        console.error(`  ❌ Error updating workflow:`, updateError);
      } else {
        console.log(`  ✅ Successfully updated!`);
      }
    } else {
      console.log(`  ✓ No updates needed`);
    }
  }

  console.log("\n🎉 Migration complete!");
}

fixWorkflowNodeTypes().catch(console.error);
