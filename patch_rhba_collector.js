/**
 * Patch script: adds fixes section extraction to rhba_collector.js
 * Run on server: node /tmp/patch_rhba_collector.js
 */

const fs = require('fs');

const COLLECTOR_PATH = '/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2/redhat/rhba_collector.js';

// Read original file
let src = fs.readFileSync(COLLECTOR_PATH, 'utf8');

// Make a backup
fs.writeFileSync(COLLECTOR_PATH + '.bak', src);
console.log('[INFO] Backup created at', COLLECTOR_PATH + '.bak');

// ===========================================================
// Patch 1: Add fixes parsing logic inside scrapeErrataPage,
// just before the return statement.
// ===========================================================
const OLD_RETURN = `        return {
            id,
            vendor: 'Red Hat',`;

const NEW_RETURN = `        // === Parse Fixes section ===
        const fixes = [];
        let fixesSection = null;
        $('h2, h3').each((i, el) => {
            if ($(el).text().trim() === 'Fixes') {
                fixesSection = $(el);
            }
        });
        if (fixesSection) {
            // Fixes are listed in a <ul> immediately following the Fixes <h2>
            const fixesUl = fixesSection.nextAll('ul').first();
            fixesUl.find('li').each((i, li) => {
                const liEl = $(li);
                const issueLink = liEl.find('a').first();
                const issueId = issueLink.text().trim();
                const issueUrl = issueLink.attr('href') || '';
                // Description: full text of <li> minus the issueId prefix
                const fullText = liEl.text().trim();
                const description = fullText.replace(issueId, '').replace(/^[\\s\\-–]+/, '').trim();
                if (issueId) {
                    fixes.push({ id: issueId, url: issueUrl, description });
                }
            });
        }

        return {
            id,
            vendor: 'Red Hat',`;

if (!src.includes(OLD_RETURN)) {
    console.error('[ERROR] Patch 1 target pattern not found! Aborting.');
    process.exit(1);
}
src = src.replace(OLD_RETURN, NEW_RETURN);
console.log('[OK] Patch 1 applied: fixes parsing logic added.');

// ===========================================================
// Patch 2: Add 'fixes' field to the returned object,
// right after the 'packages' field.
// ===========================================================
const OLD_PACKAGES = `            packages: [...new Set(packages)],
            full_text:`;

const NEW_PACKAGES = `            packages: [...new Set(packages)],
            fixes,
            full_text:`;

if (!src.includes(OLD_PACKAGES)) {
    console.error('[ERROR] Patch 2 target pattern not found! Aborting.');
    process.exit(1);
}
src = src.replace(OLD_PACKAGES, NEW_PACKAGES);
console.log('[OK] Patch 2 applied: fixes field added to return object.');

// Write patched file
fs.writeFileSync(COLLECTOR_PATH, src);
console.log('[DONE] rhba_collector.js patched successfully with fixes section support.');
