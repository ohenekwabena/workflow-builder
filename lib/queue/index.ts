import { Redis } from "@upstash/redis";

const QUEUE_KEY = "workflow:executions:queue";

// Create Redis client lazily to ensure env vars are loaded
function getRedisClient() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Redis credentials not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface QueuedWorkflow {
  executionId: string;
  workflowId: string;
  userId: string;
  nodes: any[];
  edges: any[];
  triggerInput: any;
  enqueuedAt: string;
}

export async function enqueueWorkflow(job: Omit<QueuedWorkflow, "enqueuedAt">) {
  const redis = getRedisClient();
  const queuedJob: QueuedWorkflow = {
    ...job,
    enqueuedAt: new Date().toISOString(),
  };

  // Add to Redis queue
  await redis.rpush(QUEUE_KEY, JSON.stringify(queuedJob));

  console.log(`Enqueued workflow execution: ${job.executionId}`);
}

export async function dequeueWorkflow(): Promise<QueuedWorkflow | null> {
  const redis = getRedisClient();
  const result = await redis.lpop(QUEUE_KEY);

  if (!result) return null;

  // Handle both string and object responses from Redis
  if (typeof result === "string") {
    return JSON.parse(result);
  }

  // If it's already an object, return it directly
  return result as QueuedWorkflow;
}

export async function getQueueLength(): Promise<number> {
  const redis = getRedisClient();
  return await redis.llen(QUEUE_KEY);
}
