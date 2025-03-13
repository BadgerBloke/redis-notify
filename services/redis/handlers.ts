import { redis, redisSubscriber } from "./client.ts";
import { NotificationEvent } from "./interfaces.ts";

const EXPIRATION_TIME = 1 * 60; // 1 minute in seconds

export const handleNotificationEvent = async (
  userId: string,
  eventData: string,
  shouldResetTimer = false,
) => {
  try {
    const batchKey = `notification:batch:${userId}`;
    const backupKey = `notification:backup:${userId}`;
    const expirationTime = EXPIRATION_TIME;

    // Check if user already has a batch
    let batch: NotificationEvent;
    const existingBatch = await redis.get(backupKey);

    if (existingBatch) {
      // Add to existing batch
      batch = JSON.parse(existingBatch);
      batch.content.push(eventData);

      // Optionally reset timer
    } else {
      // Create new batch
      batch = {
        userId,
        type: "RFI_EMAIL",
        subject: "RFI Email",
        content: [eventData],
        createdAt: Date.now(),
      };
      // Set the main key with expiration
      console.log(
        `New batch created for user ${userId} with expiration ${expirationTime}s`,
      );
    }

    if (shouldResetTimer && existingBatch) {
      await redis.expire(batchKey, expirationTime);
      console.log(`Timer reset for user ${userId}`);
    }

    if (existingBatch) {
      const ttl = await redis.ttl(batchKey);
      await redis.setex(batchKey, ttl, JSON.stringify(batch));
      console.log("Batch updated");
    } else {
      await redis.setex(batchKey, expirationTime, JSON.stringify(batch));
      console.log("Batch created");
    }
    // Always update the backup without expiration
    await redis.set(backupKey, JSON.stringify(batch));
    return true;
  } catch (error) {
    console.error(`Error handling notification for user ${userId}:`, error);
    throw error;
  }
};

export const processBatch = async (userId: string) => {
  try {
    const backupKey = `notification:backup:${userId}`;

    // Get the batch data from backup
    const batchData = await redis.get(backupKey);

    if (batchData) {
      const batch: NotificationEvent = JSON.parse(batchData);
      console.log(
        `Processing batch for user ${userId} with ${batch.content.length} events`,
      );

      // This is where you would call your email service
      // For this example, we'll just log it
      console.log(
        `Would send email to ${userId} containing ${batch.content.length} notifications`,
      );

      // Clean up the backup
      await redis.del(backupKey);
      return batch;
    } else {
      console.log(`No backup found for user ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error processing batch for user ${userId}:`, error);
    throw error;
  }
};

export const startExpirationListener = () => {
  try {
    // Subscribe to keyspace notifications for expired keys
    redisSubscriber.psubscribe("__keyevent@0__:expired");
    console.log("Subscribed to expiration events");

    redisSubscriber.on("pmessage", (_pattern, _channel, message) => {
      // Check if it's a notification batch that expired
      if (message.startsWith("notification:batch:")) {
        const userId = message.split(":")[2];
        console.log(`Batch expired for user ${userId}`);
        processBatch(userId);
      }
    });

    redisSubscriber.on("error", (error) => {
      console.error("Redis subscription error:", error);
    });

    console.log("Expiration listener started");
  } catch (error) {
    console.error("Failed to start expiration listener:", error);
    throw error;
  }
};

export const shutdown = async () => {
  console.log("Shutting down Redis connections...");
  await redisSubscriber.quit();
  await redis.quit();
  console.log("Redis connections closed");
};
