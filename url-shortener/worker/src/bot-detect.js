/**
 * List of common social media bot User-Agents.
 * These bots look for Open Graph tags to generate previews.
 */
const SOCIAL_BOTS = [
    'facebookexternalhit',
    'Facebot',
    'LinkedInBot',
    'Twitterbot',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'WhatsApp',
    'LINE',
    'Googlebot',
    'bingbot',
    'SkypeUriPreview',
    'Applebot'
];

/**
 * Checks if the request comes from a social media bot.
 * @param {string} userAgent - The User-Agent header string.
 * @returns {boolean} - True if the UA matches a known bot.
 */
export function isSocialBot(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return SOCIAL_BOTS.some(bot => ua.includes(bot.toLowerCase()));
}
