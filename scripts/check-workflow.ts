import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkflow(workflowId: string) {
  console.log(`🔍 Checking workflow: ${workflowId}\n`);

  const { data: workflow, error } = await supabase.from("workflows").select("*").eq("id", workflowId).single();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("📋 Workflow Details:");
  console.log(`  Name: ${workflow.name}`);
  console.log(`  Nodes: ${workflow.nodes?.length || 0}`);
  console.log(`  Edges: ${workflow.edges?.length || 0}\n`);

  console.log("🔷 Nodes:");
  workflow.nodes?.forEach((node: any, i: number) => {
    console.log(`  ${i + 1}. ${node.data.label} (${node.data.nodeType})`);
    console.log(`     ID: ${node.id}`);
    console.log(`     Config: ${JSON.stringify(node.data.config)}`);
  });

  console.log("\n🔗 Edges:");
  workflow.edges?.forEach((edge: any, i: number) => {
    const sourceNode = workflow.nodes?.find((n: any) => n.id === edge.source);
    const targetNode = workflow.nodes?.find((n: any) => n.id === edge.target);
    console.log(`  ${i + 1}. ${sourceNode?.data.label} → ${targetNode?.data.label}`);
    console.log(`     ${edge.source} → ${edge.target}`);
  });
}

const workflowId = process.argv[2] || "0bfe61fc-343c-4107-9a80-162d214e31c6";
checkWorkflow(workflowId).catch(console.error);
