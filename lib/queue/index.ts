import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const QUEUE_KEY = "workflow:executions:queue";

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
  const queuedJob: QueuedWorkflow = {
    ...job,
    enqueuedAt: new Date().toISOString(),
  };

  // Add to Redis queue
  await redis.rpush(QUEUE_KEY, JSON.stringify(queuedJob));

  console.log(`Enqueued workflow execution: ${job.executionId}`);
}

export async function dequeueWorkflow(): Promise<QueuedWorkflow | null> {
  const result = await redis.lpop(QUEUE_KEY);

  if (!result) return null;

  return JSON.parse(result as string);
}

export async function getQueueLength(): Promise<number> {
  return await redis.llen(QUEUE_KEY);
}
