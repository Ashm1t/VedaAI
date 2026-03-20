import { Worker } from "bullmq";
import { getRedisConnection } from "../config/redis.js";
import { runGenerationPipeline } from "../services/generationService.js";

let worker: Worker | null = null;

export function startWorker(): void {
  const connection = getRedisConnection();
  if (!connection) {
    console.warn("⚠ Redis not available — BullMQ worker not started");
    return;
  }

  worker = new Worker(
    "question-generation",
    async (job) => {
      const { assignmentId } = job.data;
      console.log(`Processing generation job: ${assignmentId}`);
      await runGenerationPipeline(assignmentId);
    },
    {
      connection: connection as any,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Generation job completed: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Generation job failed: ${job?.id}`, err.message);
  });

  console.log("✓ BullMQ worker started");
}

export function stopWorker(): void {
  if (worker) {
    worker.close();
    worker = null;
  }
}
