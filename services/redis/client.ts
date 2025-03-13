import { Redis } from "ioredis";

export const redis = new Redis({
  host: Deno.env.get("REDIS_HOST") || "localhost",
  port: Deno.env.get("REDIS_PORT") || 6379,
  retryStrategy: (times: number) => {
    if (times > 10) return undefined;
    return Math.min(times * 100, 2000);
  },
});

export const redisSubscriber = new Redis({
  host: Deno.env.get("REDIS_HOST") || "localhost",
  port: Deno.env.get("REDIS_PORT") || 6379,
  retryStrategy: (times: number) => {
    if (times > 10) return undefined;
    return Math.min(times * 100, 2000);
  },
});
