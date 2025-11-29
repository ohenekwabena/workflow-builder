import "dotenv/config";
import { Redis } from "@upstash/redis";

async function main() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const queueKey = "workflow:executions:queue";

  console.log("🗑️  Clearing queue...\n");

  const queueLength = await redis.llen(queueKey);
  console.log(`Items in queue before: ${queueLength}`);

  if (queueLength > 0) {
    // Delete the entire queue
    await redis.del(queueKey);
    console.log(`✅ Cleared ${queueLength} items from queue`);
  } else {
    console.log("Queue is already empty");
  }

  const afterLength = await redis.llen(queueKey);
  console.log(`Items in queue after: ${afterLength}`);
}

main();
