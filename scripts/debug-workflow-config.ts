import { supabaseAdmin } from "../lib/supabase/server";

async function debugWorkflow() {
  // Get the most recent workflow
  const { data: workflows } = await supabaseAdmin()
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!workflows || workflows.length === 0) {
    console.log("No workflows found");
    return;
  }

  const workflow = workflows[0];
  console.log("\n=== Workflow Debug Info ===");
  console.log("Workflow ID:", workflow.id);
  console.log("Workflow Name:", workflow.name);
  console.log("\nNodes:");
  console.log(JSON.stringify(workflow.nodes, null, 2));
  console.log("\nEdges:");
  console.log(JSON.stringify(workflow.edges, null, 2));

  // Find transform node
  const transformNode = workflow.nodes.find((n: any) => n.data?.nodeType === "logic:transform");
  if (transformNode) {
    console.log("\n=== Transform Node ===");
    console.log("Node ID:", transformNode.id);
    console.log("Node Type:", transformNode.data.nodeType);
    console.log("Node Config:", JSON.stringify(transformNode.data.config, null, 2));
  }
}

debugWorkflow().catch(console.error);
