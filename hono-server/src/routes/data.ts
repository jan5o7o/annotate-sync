import { Hono } from "hono";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "../lib/store.js";
import type { StoreFile } from "../lib/types.js";

const data = new Hono();

// GET /sync-data.json — list all synced data across all domains and pages
data.get("/", (c) => {
  const result: { domain: string; page: string; comments: number; updated: string }[] = [];

  if (!existsSync(DATA_DIR)) return c.json({ files: [], total: 0 });

  try {
    const domains = readdirSync(DATA_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let total = 0;
    for (const domain of domains) {
      const domainPath = join(DATA_DIR, domain);
      const files = readdirSync(domainPath, { withFileTypes: true })
        .filter((f) => f.isFile() && f.name.endsWith(".json"))
        .map((f) => f.name);

      for (const file of files) {
        const fp = join(domainPath, file);
        try {
          const store: StoreFile = JSON.parse(readFileSync(fp, "utf-8"));
          result.push({
            domain: store.domain,
            page: store.page,
            comments: store.comments.length,
            updated: store.comments.length
              ? store.comments.reduce((latest, c) => (c.updatedAt || c.createdAt) > latest ? (c.updatedAt || c.createdAt) : latest, "")
              : "",
          });
          total += store.comments.length;
        } catch { /* skip malformed files */ }
      }
    }

    return c.json({ files: result, total, generatedAt: new Date().toISOString() });
  } catch {
    return c.json({ error: "Failed to read data directory" }, 500);
  }
});

export default data;
