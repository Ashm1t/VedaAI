import { Queue } from "bullmq";
import { getRedisConnection } from "../config/redis.js";

let queue: Queue | null = null;

function getQueue(): Queue {
  if (!queue) {
    const connection = getRedisConnection();
    if (!connection) {
      throw new Error("Redis not available for job queue");
    }

    queue = new Queue("question-generation", {
      connection: connection as any,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return queue;
}

export async function enqueueGeneration(assignmentId: string): Promise<void> {
  const q = getQueue();
  await q.add("generate", { assignmentId }, { jobId: assignmentId });
  console.log(`Enqueued generation job for assignment: ${assignmentId}`);
}
