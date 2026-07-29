import { Hono } from "hono";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "../lib/store.js";
import type { StoreFile } from "../lib/types.js";

const data = new Hono();

// GET /sync-data.json — list all synced comments across all domains and pages
data.get("/", (c) => {
  const allComments: StoreFile["comments"] = [];

  if (!existsSync(DATA_DIR)) return c.json({ comments: [], total: 0, generatedAt: new Date().toISOString() });

  try {
    const domains = readdirSync(DATA_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const domain of domains) {
      const domainPath = join(DATA_DIR, domain);
      const files = readdirSync(domainPath, { withFileTypes: true })
        .filter((f) => f.isFile() && f.name.endsWith(".json"))
        .map((f) => f.name);

      for (const file of files) {
        const fp = join(domainPath, file);
        try {
          const store: StoreFile = JSON.parse(readFileSync(fp, "utf-8"));
          for (const c of store.comments) {
            allComments.push(c);
          }
        } catch { /* skip malformed files */ }
      }
    }

    return c.json({ comments: allComments, total: allComments.length, generatedAt: new Date().toISOString() });
  } catch {
    return c.json({ error: "Failed to read data directory" }, 500);
  }
});
export default data;
