import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/workflows/[id]/executions - Get execution history
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
    const { data: executions, error } = await supabase
      .from("workflow_executions")
      .select(
        `
        *,
        steps:workflow_execution_steps(duration_ms)
      `
      )
      .eq("workflow_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Calculate duration_ms from steps if not present
    const executionsWithDuration = executions?.map((execution: any) => {
      if (!execution.duration_ms && execution.steps?.length > 0) {
        execution.duration_ms = execution.steps.reduce((sum: number, step: any) => sum + (step.duration_ms || 0), 0);
      }
      // Remove steps array from response
      delete execution.steps;
      return execution;
    });

    return NextResponse.json({ executions: executionsWithDuration });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
