import "dotenv/config";
import { Redis } from "@upstash/redis";

async function main() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  console.log("🔍 Checking Redis Queue...\n");

  // Check both possible queue keys
  const queueKey1 = "workflow_queue";
  const queueKey2 = "workflow:executions:queue";

  const queueLength1 = await redis.llen(queueKey1);
  const queueLength2 = await redis.llen(queueKey2);

  console.log(`Queue length (${queueKey1}): ${queueLength1}`);
  console.log(`Queue length (${queueKey2}): ${queueLength2}`);

  const queueKey = queueLength2 > 0 ? queueKey2 : queueKey1;
  const queueLength = queueLength2 > 0 ? queueLength2 : queueLength1;

  if (queueLength > 0) {
    // Peek at items without removing them
    const items = await redis.lrange(queueKey, 0, -1);
    console.log(`\nQueued items (${items.length}):`);
    items.forEach((item, index) => {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      console.log(`  ${index + 1}. Execution ID: ${parsed.executionId}`);
      console.log(`     Workflow ID: ${parsed.workflowId}`);
      console.log(`     User ID: ${parsed.userId}`);
    });
  } else {
    console.log("\n✅ Queue is empty");
  }
}

main();
