# Cloudflare Short URL System

## Setup Instructions

### 1. Install Dependencies
Run the following command in this directory:
```bash
npm install
cd worker && npm install && cd ..
```

### 2. Cloudflare Login
Ensure you are logged in to Cloudflare:
```bash
npx wrangler login
```

### 3. Create Resources
You need to create a KV Namespace and an R2 Bucket.

**Create KV Namespace:**
```bash
npx wrangler kv:namespace create LINKS
```
*Copy the `id` from the output.*

**Create Preview KV Namespace (for local dev):**
```bash
npx wrangler kv:namespace create LINKS --preview
```
*Copy the `preview_id` from the output.*

**Create R2 Bucket:**
```bash
npx wrangler r2 bucket create url-shortener-images
```

### 4. Update Configuration
Open `wrangler.toml` (in root) and `worker/wrangler.toml`.
Replace `REPLACE_WITH_YOUR_KV_ID` and `REPLACE_WITH_YOUR_PREVIEW_KV_ID` with the IDs you generated above.

### 5. Run Locally
To start the Pages frontend:
```bash
npm run dev:pages
```

To start the Worker backend:
```bash
npm run dev:worker
```
