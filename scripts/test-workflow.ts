import { createClient } from "@supabase/supabase-js";

async function testWorkflow() {
  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Add this to your .env
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Get or create a test user
    const testUserId = "ff36d59c-5b90-44b7-8578-9fd5d3f1252e"; // Replace with actual user ID

    // Insert workflow directly
    const { data: workflow, error } = await supabase
      .from("workflows")
      .insert({
        user_id: testUserId,
        name: "Test Workflow",
        description: "Testing workflow execution",
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            data: {
              label: "Manual Trigger",
              nodeType: "trigger:manual",
              config: {},
            },
          },
          {
            id: "weather-1",
            type: "data",
            data: {
              label: "Get Weather",
              nodeType: "data:weather",
              config: { city: "London" },
            },
          },
        ],
        edges: [{ id: "e1", source: "trigger-1", target: "weather-1" }],
      })
      .select()
      .single();

    if (error) throw error;

    console.log("Workflow created:", workflow.id);

    // Test execution via API or direct DB insert
    const { data: execution } = await supabase
      .from("workflow_executions")
      .insert({
        workflow_id: workflow.id,
        status: "pending",
        trigger_data: {},
      })
      .select()
      .single();

    console.log("Execution created:", execution?.id);
  } catch (error) {
    console.error("Error:", error);
  }
}

testWorkflow();
