import { configureRedis } from "./config.ts";
import {
  handleNotificationEvent,
  shutdown,
  startExpirationListener,
} from "./handlers.ts";

export const init = async () => {
  try {
    // Configure Redis for expiration notifications
    await configureRedis();

    // Start listening for expired keys
    startExpirationListener();

    console.log("Notification service initialized successfully");

    // Setup graceful shutdown
    Deno.addSignalListener("SIGINT", async () => {
      console.log("Received SIGINT signal");
      await shutdown();
      Deno.exit(0);
    });

    // Deno.addSignalListener("SIGTERM", async () => {
    //   console.log("Received SIGTERM signal");
    //   await shutdown();
    //   Deno.exit(0);
    // });

    // Example: Add a test notification
    const userId = "user123";
    await handleNotificationEvent(
      userId,
      JSON.stringify({
        type: "email",
        subject: "Test notification",
        content: "This is a test notification",
        timestamp: Date.now(),
      }),
      true, // reset timer on new events
    );

    console.log(`Test notification added for user ${userId}`);
  } catch (error) {
    console.error("Failed to initialize notification service:", error);
    Deno.exit(1);
  }
};
