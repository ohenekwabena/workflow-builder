import { config } from "dotenv";
import { resolve } from "path";
import { Redis } from "@upstash/redis";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const QUEUE_KEY = "workflow:executions:queue";

async function clearQueue() {
  console.log("🧹 Clearing workflow execution queue...");

  const length = await redis.llen(QUEUE_KEY);
  console.log(`Queue has ${length} items`);

  if (length > 0) {
    await redis.del(QUEUE_KEY);
    console.log("✅ Queue cleared!");
  } else {
    console.log("✅ Queue is already empty");
  }
}

clearQueue().catch(console.error);
