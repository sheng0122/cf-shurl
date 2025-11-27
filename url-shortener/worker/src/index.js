import { isSocialBot } from './bot-detect';
import { generateOGPage } from './og-page';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const code = url.pathname.slice(1); // Remove leading slash

        // 1. Handle Root Path (Optional: Redirect to Admin Dashboard or Landing Page)
        if (!code) {
            return new Response('Welcome to the Short URL Service. Please provide a short code.', { status: 200 });
        }

        // 2. Lookup Link in KV
        // We expect the value to be a JSON string
        const data = await env.LINKS.get(code, 'json');

        // 3. Handle Not Found
        if (!data) {
            return new Response('Short link not found', { status: 404 });
        }

        // 4. Bot Detection & OG Page Serving
        const userAgent = request.headers.get('User-Agent') || '';

        // Check if it's a bot AND if OG tags are enabled for this link
        if (isSocialBot(userAgent) && data.og?.enabled) {
            const html = generateOGPage(data, code, url.origin);
            return new Response(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache' // Ensure bots get fresh data
                }
            });
        }

        // 5. Analytics (Async Update)
        // We use ctx.waitUntil to ensure this doesn't block the response
        ctx.waitUntil(updateClicks(env, code, data, request));

        // 6. Redirect User
        return Response.redirect(data.url, 302); // 302 for temporary (allows tracking), 301 for permanent
    }
};

import { UAParser } from 'ua-parser-js';

// ... (existing imports)

/**
 * Updates the click count and detailed analytics in KV.
 */
async function updateClicks(env, code, data, request) {
    try {
        const ua = new UAParser(request.headers.get('User-Agent') || '');
        const browser = ua.getBrowser().name || 'Unknown';
        const os = ua.getOS().name || 'Unknown';
        const device = ua.getDevice().type || 'Desktop';
        const country = request.cf?.country || 'Unknown';
        const referer = request.headers.get('Referer') || 'Direct';

        // Initialize analytics structure if missing
        const analytics = data.analytics || {
            browsers: {},
            os: {},
            devices: {},
            countries: {},
            referers: {}
        };

        // Helper to increment counter
        const inc = (obj, key) => {
            obj[key] = (obj[key] || 0) + 1;
        };

        inc(analytics.browsers, browser);
        inc(analytics.os, os);
        inc(analytics.devices, device);
        inc(analytics.countries, country);
        inc(analytics.referers, referer);

        const updatedData = {
            ...data,
            clicks: (data.clicks || 0) + 1,
            lastClickedAt: new Date().toISOString(),
            analytics
        };

        // Write back to KV
        await env.LINKS.put(code, JSON.stringify(updatedData));
        console.log(`Updated stats for ${code}:`, updatedData);

        // Store Daily Stats for Time Series
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dailyKey = `stats:${code}:${today}`;

        // We use a separate KV key for daily stats to avoid race conditions on the main object
        // and to keep the main object small.
        // Note: KV doesn't have atomic increment, so this is still eventually consistent.
        // For production high-scale, use Durable Objects or Write-Heavy storage.
        const currentDaily = await env.LINKS.get(dailyKey, 'json') || { clicks: 0 };
        currentDaily.clicks++;
        await env.LINKS.put(dailyKey, JSON.stringify(currentDaily));

    } catch (err) {
        console.error(`Failed to update stats for ${code}:`, err);
    }
}
