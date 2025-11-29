import { NextRequest, NextResponse } from "next/server";
import { processWorkflowQueue } from "@/lib/queue/worker";

// This endpoint will be called by Vercel Cron or external cron service
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Process one workflow from queue
    await processWorkflowQueue();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
