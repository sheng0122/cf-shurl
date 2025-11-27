import { isSocialBot } from './worker/src/bot-detect.js';
import { generateOGPage } from './worker/src/og-page.js';
import assert from 'assert';

console.log('Running Worker Logic Tests...\n');

// 1. Test Bot Detection
console.log('Test 1: Bot Detection');
const bots = [
    'facebookexternalhit/1.1',
    'Twitterbot/1.0',
    'Slackbot-LinkExpanding 1.0',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
];
const users = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    'curl/7.64.1'
];

bots.forEach(ua => {
    assert.strictEqual(isSocialBot(ua), true, `Should detect bot: ${ua}`);
});
users.forEach(ua => {
    assert.strictEqual(isSocialBot(ua), false, `Should NOT detect user: ${ua}`);
});
console.log('✅ Bot detection passed.\n');

// 2. Test OG Page Generation
console.log('Test 2: OG Page Generation');
const mockData = {
    url: 'https://example.com',
    og: {
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        siteName: 'Test Site'
    }
};
const html = generateOGPage(mockData, 'test-code', 'https://short.link');

assert.ok(html.includes('<title>Test Title</title>'), 'HTML should contain title');
assert.ok(html.includes('content="Test Description"'), 'HTML should contain description');
assert.ok(html.includes('content="https://example.com/image.jpg"'), 'HTML should contain image');
assert.ok(html.includes('http-equiv="refresh" content="0;url=https://example.com"'), 'HTML should contain redirect');

console.log('✅ OG Page generation passed.\n');

console.log('🎉 All tests passed!');
