import { redis } from "./client.ts";

export const configureRedis = async () => {
  try {
    // Ex = Enable notifications for expired events
    await redis.config("SET", "notify-keyspace-events", "Ex");
    console.log("Redis configured for expiration notifications");
  } catch (error) {
    console.error("Failed to configure Redis:", error);
    throw error;
  }
};
