import { nanoid } from 'nanoid';

/**
 * GET /api/links
 * Lists all short links.
 * Note: For high scale, we should use a cursor-based pagination or a separate index.
 * Here we use a simple "_index" key approach for simplicity as per plan.
 */
export async function onRequestGet({ env }) {
    try {
        const index = await env.LINKS.get('_index', 'json') || [];

        // Fetch all links in parallel
        // Warning: This can hit subrequest limits if list is huge. 
        // For production, implement pagination (limit/offset).
        const links = await Promise.all(
            index.map(async (code) => {
                const data = await env.LINKS.get(code, 'json');
                return data ? { code, ...data } : null;
            })
        );

        // Filter out any nulls (orphaned index entries)
        const cleanLinks = links.filter(l => l !== null);

        return Response.json({ success: true, data: cleanLinks });
    } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}

/**
 * POST /api/links
 * Creates a new short link.
 */
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { url, slug, og, tags } = body;

        // 1. Validate URL
        try {
            new URL(url);
        } catch {
            return Response.json({ success: false, error: 'Invalid URL' }, { status: 400 });
        }

        // 2. Generate or Validate Slug
        let code = slug;
        if (!code) {
            code = nanoid(8); // Generate 8-char random ID
        } else {
            // Check for duplicates
            const existing = await env.LINKS.get(code);
            if (existing) {
                return Response.json({ success: false, error: 'Slug already exists' }, { status: 409 });
            }
        }

        // 3. Prepare Data
        const newLink = {
            url,
            createdAt: new Date().toISOString(),
            clicks: 0,
            tags: tags || [],
            og: og || { enabled: false }
        };

        // 4. Save to KV
        await env.LINKS.put(code, JSON.stringify(newLink));

        // 5. Update Index
        const index = await env.LINKS.get('_index', 'json') || [];
        if (!index.includes(code)) {
            index.unshift(code); // Add to beginning
            await env.LINKS.put('_index', JSON.stringify(index));
        }

        return Response.json({ success: true, data: { code, ...newLink } });
    } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}
