import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

import { processWorkflowQueue } from "@/lib/queue/worker";

// Run the queue processor manually for testing
async function main() {
  console.log("🔄 Processing workflow queue...");
  console.log("Redis URL:", process.env.UPSTASH_REDIS_REST_URL);
  console.log("Redis Token:", process.env.UPSTASH_REDIS_REST_TOKEN ? "✓" : "✗");
  
  try {
    await processWorkflowQueue();
    console.log("✅ Queue processed successfully");
  } catch (error) {
    console.error("❌ Error processing queue:", error);
    process.exit(1);
  }
}

main();
