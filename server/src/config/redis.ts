import IORedis from "ioredis";
import { config } from "./index.js";

let validatedConnection: IORedis | null = null;
let redisDisabled = false;

/**
 * Attempt to connect to Redis and validate credentials.
 * Must be called once at startup.
 */
export async function initRedis(): Promise<void> {
  if (!config.redisUrl) {
    console.warn("⚠ REDIS_URL not set — job queue disabled");
    redisDisabled = true;
    return;
  }

  if (
    !config.redisUrl.startsWith("redis://") &&
    !config.redisUrl.startsWith("rediss://")
  ) {
    console.warn("⚠ REDIS_URL is not a valid Redis URL — job queue disabled");
    redisDisabled = true;
    return;
  }

  return new Promise<void>((resolve) => {
    const conn = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 1) return null; // Only retry once
        return 1000;
      },
    });

    // Suppress unhandled error events
    conn.on("error", () => {});

    const failAndCleanup = (reason: string) => {
      if (redisDisabled) return; // Already handled
      redisDisabled = true;
      console.error(`✗ Redis: ${reason}`);
      console.warn("  Job queue disabled — generation will run directly.\n");
      conn.disconnect();
      resolve();
    };

    // Timeout fallback
    const timer = setTimeout(() => {
      failAndCleanup("Connection timed out");
    }, 4000);

    conn.on("ready", () => {
      clearTimeout(timer);
      console.log("✓ Redis connected");
      validatedConnection = conn;
      resolve();
    });

    conn.on("close", () => {
      clearTimeout(timer);
      if (!validatedConnection) {
        failAndCleanup("Connection closed (likely auth failure — check REDIS_URL password)");
      }
    });
  });
}

/**
 * Returns the validated Redis connection, or null if unavailable.
 */
export function getRedisConnection(): IORedis | null {
  if (redisDisabled) return null;
  return validatedConnection;
}
