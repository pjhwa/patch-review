/**
 * Quick rescrape script for a specific RHBA ID to test fixes integration
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

const COOKIE_FILE = './cookie.txt';
const OUTPUT_DIR = './redhat_data';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

let COOKIE = '';
try {
    COOKIE = fs.readFileSync(COOKIE_FILE, 'utf8').trim();
} catch (e) {
    console.error('[ERROR] cookie.txt 파일이 없습니다!');
    process.exit(1);
}

function cleanText(text) {
    return text.replace(/Skip to navigation|Skip to main content|Subscriptions|Downloads|Red Hat Console|Utilities|Top Products|Product Life Cycles|Knowledge|Training and Certification|About|Course Index|Certification Index|Skill Assessment|Red Hat Knowledge Center|Product Compliance/g, '')
        .replace(/\n\s+/g, ' ').trim();
}

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
    const id = 'RHBA-2025:20533';
    const url = `https://access.redhat.com/errata/${id}`;
    console.log(`[TEST] Rescraping ${id}...`);

    const r = await httpsGet(url);
    if (r.status !== 200) {
        console.error(`[FAIL] HTTP ${r.status}`);
        process.exit(1);
    }

    const $ = cheerio.load(r.body);

    // Description
    let description = '';
    $('h2, h3').each((i, el) => {
        const heading = $(el).text().trim();
        if (heading.includes('Description') || heading.includes('Bug Fix') || heading.includes('Enhancement')) {
            description += $(el).nextUntil('h2, h3').text().trim() + '\n';
        }
    });
    if (!description) description = $('.errata-description, article').text().trim();

    // Packages
    const packages = [];
    $('td, li, .list-group-item, table tr td').each((i, el) => {
        let text = $(el).text().trim();
        if ((text.includes('.el') || text.includes('.rpm')) && text.length > 5) {
            if (text.includes('JIRA') || text.includes('Rebuild') || text.includes('updates dse.ldif')) return;
            text = text.replace(/\.rpm/g, '').trim();
            packages.push(text);
        }
    });

    // === Parse Fixes section ===
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

    const result = {
        id,
        vendor: 'Red Hat',
        type: 'Bug Fix Advisory (RHBA)',
        title: `Red Hat Bug Fix Advisory: selinux-policy bug fix and enhancement update`,
        url,
        severity: 'None',
        description: cleanText(description) || '',
        packages: [...new Set(packages)],
        fixes,
        full_text: cleanText(description) || ''
    };

    const outPath = path.join(OUTPUT_DIR, `${id.replace(/[^a-zA-Z0-9:_-]/g, '_')}.json`);
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

    console.log(`\n[RESULT] fixes count: ${fixes.length}`);
    console.log(`[RESULT] First 2 fixes:`);
    fixes.slice(0, 2).forEach(f => console.log('  -', f.id, ':', f.description));
    console.log(`\n[OK] Written to: ${outPath}`);
})();
