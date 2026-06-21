import "./load-env.js";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 8080);

app.use("/*", cors());

serve({ fetch: app.fetch, port }, () => {
  console.log(`nakanaori-api listening on :${port}`);
});
