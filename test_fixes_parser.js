/**
 * Test script: verify that the fixes section is parsed correctly
 * from RHBA-2025:20533
 */

const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

const COOKIE = fs.readFileSync(
    '/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2/redhat/cookie.txt',
    'utf8'
).trim();

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function httpsGet(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'Cookie': COOKIE,
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/json'
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

(async () => {
    const r = await httpsGet('https://access.redhat.com/errata/RHBA-2025:20533');
    console.log('HTTP Status:', r.status);

    const $ = cheerio.load(r.body);
    const fixes = [];
    let fixesSection = null;

    $('h2, h3').each((i, el) => {
        if ($(el).text().trim() === 'Fixes') {
            fixesSection = $(el);
        }
    });

    if (fixesSection) {
        const fixesUl = fixesSection.nextAll('ul').first();
        fixesUl.find('li').each((i, li) => {
            const liEl = $(li);
            const issueLink = liEl.find('a').first();
            const issueId = issueLink.text().trim();
            const issueUrl = issueLink.attr('href') || '';
            const fullText = liEl.text().trim();
            const description = fullText.replace(issueId, '').replace(/^[\s\-–]+/, '').trim();
            if (issueId) {
                fixes.push({ id: issueId, url: issueUrl, description });
            }
        });
    }

    console.log('Fixes section found:', fixesSection !== null);
    console.log('Total fixes:', fixes.length);
    console.log('\nFirst 3 fixes:');
    fixes.slice(0, 3).forEach(f => {
        console.log(JSON.stringify(f, null, 2));
    });

    if (fixes.length > 0) {
        console.log('\n[PASS] Fixes parsing works correctly!');
    } else {
        console.log('\n[FAIL] No fixes found - needs investigation');
    }
})();
