import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { enqueueWorkflow } from "@/lib/queue";
import { CronExpressionParser } from "cron-parser";

// This endpoint checks for workflows with schedule triggers and executes them
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Checking for scheduled workflows...");

    // Get all active workflows
    const { data: workflows, error } = await supabaseAdmin().from("workflows").select("*").eq("is_active", true);

    if (error) throw error;

    let triggered = 0;
    const now = new Date();

    for (const workflow of workflows || []) {
      // Find schedule trigger nodes
      const scheduleTriggers = workflow.nodes?.filter((node: any) => node.data?.nodeType === "trigger:schedule");

      for (const trigger of scheduleTriggers || []) {
        const schedule = trigger.data?.config?.schedule;
        if (!schedule) continue;

        try {
          console.log(`  Checking workflow: ${workflow.name}`);
          console.log(`    Schedule: ${schedule}`);

          // Parse cron expression and check if it should run now
          const interval = CronExpressionParser.parse(schedule);
          const nextRun = interval.prev().toDate();
          const now = new Date();

          // Check if the next scheduled time is within the last minute
          const timeDiff = now.getTime() - nextRun.getTime();
          const shouldRun = timeDiff >= 0 && timeDiff < 60000; // Within last 60 seconds

          if (!shouldRun) {
            console.log(`    ⏭️  Skipping - not scheduled to run now (next: ${nextRun.toISOString()})`);
            continue;
          }

          // Check if we already executed this in the last 90 seconds (buffer for timing)
          const { data: recentExecution } = await supabaseAdmin()
            .from("workflow_executions")
            .select("id, created_at")
            .eq("workflow_id", workflow.id)
            .eq("trigger_type", "schedule")
            .gte("created_at", new Date(now.getTime() - 90000).toISOString()) // Last 90 seconds
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (recentExecution) {
            console.log(
              `    ⏭️  Skipping - executed ${Math.round(
                (now.getTime() - new Date(recentExecution.created_at).getTime()) / 1000
              )}s ago`
            );
            continue;
          }

          // Create execution
          const { data: execution, error: execError } = await supabaseAdmin()
            .from("workflow_executions")
            .insert({
              workflow_id: workflow.id,
              user_id: workflow.user_id,
              status: "queued",
              trigger_type: "schedule",
            })
            .select()
            .single();

          if (execError) {
            console.error(`Failed to create execution for workflow ${workflow.id}:`, execError);
            continue;
          }

          // Enqueue for processing
          await enqueueWorkflow({
            executionId: execution.id,
            workflowId: workflow.id,
            userId: workflow.user_id,
            nodes: workflow.nodes,
            edges: workflow.edges,
            triggerInput: {
              trigger_type: "schedule",
              schedule,
              triggered_at: now.toISOString(),
            },
          });

          console.log(`    ✅ Triggered execution: ${execution.id}`);
          triggered++;
        } catch (cronError) {
          console.error(`Error processing workflow ${workflow.id}:`, cronError);
        }
      }
    }

    console.log(`[CRON] Triggered ${triggered} scheduled workflows`);
    return NextResponse.json({ success: true, triggered });
  } catch (error: any) {
    console.error("Schedule check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
