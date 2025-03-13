import app from "./app.ts";
import { init } from "./services/redis/main.ts";

init();

console.log("Server started");

Deno.serve(app.fetch);
