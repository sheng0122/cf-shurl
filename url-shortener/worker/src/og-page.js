/**
 * Generates an HTML page with Open Graph tags for social media previews.
 * @param {Object} data - The link data object from KV.
 * @param {string} code - The short code.
 * @param {string} origin - The origin (domain) of the short link.
 * @returns {string} - The complete HTML string.
 */
export function generateOGPage(data, code, origin) {
    const { url, og } = data;
    const shortUrl = `${origin}/${code}`;

    // Default values if OG data is missing
    const title = escapeHtml(og?.title || 'Short Link');
    const description = escapeHtml(og?.description || 'Click to visit the link.');
    const image = og?.image || '';
    const siteName = escapeHtml(og?.siteName || '');
    const twitterCard = og?.twitterCard || 'summary_large_image';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  ${image ? `<meta property="og:image" content="${image}">` : ''}
  <meta property="og:url" content="${shortUrl}">
  <meta property="og:type" content="website">
  ${siteName ? `<meta property="og:site_name" content="${siteName}">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="${twitterCard}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  ${image ? `<meta name="twitter:image" content="${image}">` : ''}
  
  <!-- Redirect for browsers that ignore meta refresh (backup) -->
  <meta http-equiv="refresh" content="0;url=${url}">
  <link rel="canonical" href="${url}">
  
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f9fafb; color: #111827; }
    .container { text-align: center; padding: 2rem; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <p>Redirecting to <a href="${url}">${url}</a>...</p>
  </div>
  <script>window.location.href = "${url}";</script>
</body>
</html>`;
}

/**
 * Escapes special characters in HTML strings to prevent XSS.
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
