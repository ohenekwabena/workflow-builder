import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase/server";

async function main() {
  const workflowId = "0bfe61fc-343c-4107-9a80-162d214e31c6";

  // Update the HTTP Request node to use a working endpoint
  const { data: workflow } = await supabaseAdmin().from("workflows").select("*").eq("id", workflowId).single();

  if (!workflow) {
    console.error("Workflow not found");
    return;
  }

  const nodes = workflow.nodes;

  // Find the HTTP Request node and update its URL
  const httpNode = nodes.find((n: any) => n.data.nodeType === "action:http_request");
  if (httpNode) {
    httpNode.data.config.url = "https://api.github.com/users/github";
    console.log("✅ Updated HTTP Request URL to working GitHub endpoint");
  }

  // Remove the AI Summarizer node and its edge
  const filteredNodes = nodes.filter((n: any) => n.data.nodeType !== "logic:ai_summarizer");
  const filteredEdges = workflow.edges.filter(
    (e: any) => !nodes.some((n: any) => n.id === e.target && n.data.nodeType === "logic:ai_summarizer")
  );

  console.log(`📋 Nodes before: ${nodes.length}, after: ${filteredNodes.length}`);
  console.log(`🔗 Edges before: ${workflow.edges.length}, after: ${filteredEdges.length}`);

  // Update workflow
  const { error } = await supabaseAdmin()
    .from("workflows")
    .update({
      nodes: filteredNodes,
      edges: filteredEdges,
    })
    .eq("id", workflowId);

  if (error) {
    console.error("Error updating workflow:", error);
    return;
  }

  console.log("\n✅ Workflow updated successfully!");
  console.log("   - Removed AI Summarizer node (requires Anthropic credits)");
  console.log("   - Updated HTTP Request to working GitHub API endpoint");
  console.log("\nYou can now test the workflow with just:");
  console.log("   1. Schedule Trigger");
  console.log("   2. HTTP Request (GitHub API)");
}

main();
