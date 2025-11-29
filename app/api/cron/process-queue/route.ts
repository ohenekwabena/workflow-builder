import { NextRequest, NextResponse } from "next/server";
import { processWorkflowQueue } from "@/lib/queue/worker";
import { getQueueLength } from "@/lib/queue";

// This endpoint will be called by Vercel Cron or external cron service
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const queueLength = await getQueueLength();
    console.log(`[CRON] Processing queue... ${queueLength} items waiting`);

    // Process all queued items (max 10 per cron run to avoid timeout)
    let processed = 0;
    while ((await getQueueLength()) > 0 && processed < 10) {
      await processWorkflowQueue();
      processed++;
    }

    console.log(`[CRON] Processed ${processed} workflow executions`);
    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
