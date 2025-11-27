/**
 * GET /api/links/[code]
 * Fetch a single link details.
 */
export async function onRequestGet({ params, env }) {
    const { code } = params;
    const data = await env.LINKS.get(code, 'json');

    if (!data) {
        return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Fetch Daily Stats (Last 30 Days)
    const dailyStats = {};
    const today = new Date();

    // Create array of promises for parallel fetching
    const promises = [];
    const dates = [];

    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dates.push(dateStr);
        promises.push(env.LINKS.get(`stats:${code}:${dateStr}`, 'json'));
    }

    const results = await Promise.all(promises);

    results.forEach((res, index) => {
        if (res) {
            dailyStats[dates[index]] = res.clicks;
        }
    });

    return Response.json({ success: true, data: { code, ...data, dailyStats } });
}

/**
 * PUT /api/links/[code]
 * Update a link.
 */
export async function onRequestPut({ params, request, env }) {
    const { code } = params;
    const updates = await request.json();

    const existing = await env.LINKS.get(code, 'json');
    if (!existing) {
        return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const updatedData = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await env.LINKS.put(code, JSON.stringify(updatedData));

    return Response.json({ success: true, data: { code, ...updatedData } });
}

/**
 * DELETE /api/links/[code]
 * Delete a link.
 */
export async function onRequestDelete({ params, env }) {
    const { code } = params;

    const existing = await env.LINKS.get(code);
    if (!existing) {
        return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // 1. Delete from KV
    await env.LINKS.delete(code);

    // 2. Remove from Index
    const index = await env.LINKS.get('_index', 'json') || [];
    const newIndex = index.filter(c => c !== code);
    await env.LINKS.put('_index', JSON.stringify(newIndex));

    return Response.json({ success: true });
}
