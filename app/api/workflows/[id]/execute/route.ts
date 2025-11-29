import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { enqueueWorkflow } from "@/lib/queue";

// POST /api/workflows/[id]/execute - Trigger workflow execution
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch workflow
    const { data: workflow, error: workflowError } = await supabaseAdmin()
      .from("workflows")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const triggerInput = body.input || {};

    // Create execution record
    const { data: execution, error: executionError } = await supabaseAdmin()
      .from("workflow_executions")
      .insert({
        workflow_id: workflow.id,
        user_id: user.id,
        status: "queued",
        trigger_type: "manual",
      })
      .select()
      .single();

    if (executionError) throw executionError;

    // Enqueue for background processing
    await enqueueWorkflow({
      executionId: execution.id,
      workflowId: workflow.id,
      userId: user.id,
      nodes: workflow.nodes,
      edges: workflow.edges,
      triggerInput,
    });

    return NextResponse.json({
      execution_id: execution.id,
      status: "queued",
      message: "Workflow execution started",
    });
  } catch (error: any) {
    console.error("Execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
