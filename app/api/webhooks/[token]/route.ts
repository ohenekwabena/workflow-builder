import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { enqueueWorkflow } from "@/lib/queue";

// POST /api/webhooks/[token] - Receive webhook trigger
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    // Verify webhook token
    const { data: webhook, error } = await supabaseAdmin()
      .from("webhook_endpoints")
      .select(
        `
        *,
        workflows (*)
      `
      )
      .eq("webhook_token", token)
      .eq("is_active", true)
      .single();

    if (error || !webhook) {
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 404 });
    }

    // Parse webhook payload
    const payload = await request.json();

    // Create execution record
    const { data: execution, error: executionError } = await supabaseAdmin()
      .from("workflow_executions")
      .insert({
        workflow_id: webhook.workflow_id,
        user_id: webhook.user_id,
        status: "queued",
        trigger_type: "webhook",
      })
      .select()
      .single();

    if (executionError) throw executionError;

    // Update last triggered timestamp
    await supabaseAdmin()
      .from("webhook_endpoints")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", webhook.id);

    // Enqueue workflow
    await enqueueWorkflow({
      executionId: execution.id,
      workflowId: webhook.workflows.id,
      userId: webhook.user_id,
      nodes: webhook.workflows.nodes,
      edges: webhook.workflows.edges,
      triggerInput: payload,
      triggerType: "webhook",
    });

    return NextResponse.json({
      success: true,
      execution_id: execution.id,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data: webhook } = await supabaseAdmin()
    .from("webhook_endpoints")
    .select("id, workflow_id, is_active")
    .eq("webhook_token", token)
    .single();

  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  return NextResponse.json({
    webhook_id: webhook.id,
    workflow_id: webhook.workflow_id,
    is_active: webhook.is_active,
    message: "Webhook is active. Use POST to trigger.",
  });
}
