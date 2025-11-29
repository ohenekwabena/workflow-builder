import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, supabaseAdmin } from "@/lib/supabase/server";

// POST /api/workflows/[id]/webhook - Create webhook for workflow
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

    // Verify workflow ownership
    const { data: workflow } = await supabase
      .from("workflows")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Create webhook endpoint
    const { data: webhook, error } = await supabaseAdmin()
      .from("webhook_endpoints")
      .insert({
        user_id: user.id,
        workflow_id: id,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/${webhook.webhook_token}`;

    return NextResponse.json({
      webhook_id: webhook.id,
      webhook_url: webhookUrl,
      webhook_token: webhook.webhook_token,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/workflows/[id]/webhook - Get webhook for workflow
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { data: webhook } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .eq("workflow_id", id)
      .eq("user_id", user.id)
      .single();

    if (!webhook) {
      return NextResponse.json({ webhook: null });
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/${webhook.webhook_token}`;

    return NextResponse.json({
      webhook_id: webhook.id,
      webhook_url: webhookUrl,
      webhook_token: webhook.webhook_token,
      is_active: webhook.is_active,
      last_triggered_at: webhook.last_triggered_at,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
