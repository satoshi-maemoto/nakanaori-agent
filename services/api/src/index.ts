import "./load-env.js";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 8080);
const hostname = process.env.HOST ?? "0.0.0.0";

app.use("/*", cors());

serve({ fetch: app.fetch, port, hostname }, () => {
  console.log(`nakanaori-api listening on http://${hostname}:${port}`);
});
