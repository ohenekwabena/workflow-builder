import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// GET /api/executions/[id] - Get execution with steps
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

    // Fetch execution
    const { data: execution, error: execError } = await supabase
      .from("workflow_executions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (execError || !execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    // Fetch execution steps
    const { data: steps, error: stepsError } = await supabase
      .from("workflow_execution_steps")
      .select("*")
      .eq("execution_id", id)
      .order("created_at", { ascending: true });

    if (stepsError) throw stepsError;

    // Combine execution with steps
    return NextResponse.json({
      execution: {
        ...execution,
        steps: steps || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
