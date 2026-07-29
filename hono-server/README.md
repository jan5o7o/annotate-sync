# annotate-sync Hono Server

Self-hosted backend for [Annotate + Sync](https://github.com/jan5o7o/annotate-sync). Stores annotations as JSON files on disk.

## Quick Start

```bash
cd hono-server
npm install
npm start        # runs on http://localhost:3099
```

## API

### `POST /api/sync`

Push or delete a comment.

```json
// Upsert
{ "action": "upsert", "comment": { "id": "...", "page": "...", "type": "pin", "author": "...", "text": "...", ... } }

// Delete
{ "action": "delete", "annotateId": "c1a2b3..." }
```

### `GET /api/sync?domain=example.com&page=/about`

Pull comments for a specific domain and page.

### `GET /sync-data.json`

List all synced comments across all domains and pages.

```json
{
  "comments": [{ "id": "...", "page": "...", "type": "pin", "text": "...", ... }],
  "total": 1,
  "generatedAt": "2026-07-29T12:00:00.000Z"
}
```

## Storage

Comments are stored as JSON files under `data/<domain>/<page>.json`. Each domain gets its own directory.

```
data/
├── example.com/
│   ├── _about.json
│   └── _pricing.json
└── staging.example.com/
    └── index.json
```

## Deployment

### systemd (user)

```bash
# Create service
mkdir -p ~/.config/systemd/user
# See repo for example unit file

systemctl --user daemon-reload
systemctl --user enable --now annotate-hono
```

### nginx

```nginx
location / {
    proxy_pass http://127.0.0.1:3099;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
}
```

## Dev

```bash
npm run dev     # tsx watch — auto-reload on changes
npx vitest      # run tests
```
