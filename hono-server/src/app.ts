import { Hono } from "hono";
import { cors } from "hono/cors";
import syncRoutes from "./routes/sync.js";
import dataRoutes from "./routes/data.js";

const app = new Hono();

app.use("/*", cors());
app.route("/api/sync", syncRoutes);
app.route("/sync-data.json", dataRoutes);

export default app;
