import { Hono } from "@hono/hono";
import { handleNotificationEvent } from "./services/redis/main.ts";
import { NotificationEvent } from "./services/redis/interfaces.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello World!");
});

app.patch("/notifications/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body: NotificationEvent | undefined = await c.req.json();

  if (!body) {
    return c.json({
      status: "error",
      message: "Invalid request body",
    });
  }

  // Handle the notification event
  await handleNotificationEvent(userId, body.content[0]);

  return c.json({
    status: "ok",
  });
});

export default app;
