const fs = require('fs');

const text = fs.readFileSync('/tmp/RHSA-2026_3488.txt', 'utf8')
    .replace(/[ \t]+/g, ' ')
    .replace(/ \n /g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const detailsObj = {
    overview: '',
    description: '',
    packages: [],
    cves: [],
    fixes: '',
    notes: ''
};

const getSection = (header, nextHeaders) => {
    const regex = new RegExp(`(?:^|\\n)${header}\\s*\\n(.*?)(?:\\n(?:${nextHeaders.join('|')})\\s*\\n|$)`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
};

const rhHeaders = ['Synopsis', 'Topic', 'Description', 'Solution', 'Affected Products', 'Fixes', 'CVEs', 'References', 'Updated Packages'];

detailsObj.overview = getSection('Topic', rhHeaders);
detailsObj.description = getSection('Description', rhHeaders);
detailsObj.fixes = getSection('Fixes', rhHeaders);

const cvesText = getSection('CVEs', rhHeaders);
if (cvesText) {
    detailsObj.cves = [...new Set(cvesText.match(/CVE-\d{4}-\d+/g) || [])];
} else {
    const allCves = text.match(/CVE-\d{4}-\d+/g);
    if (allCves) detailsObj.cves = [...new Set(allCves)];
}

const pkgsText = getSection('Updated Packages', rhHeaders);
if (pkgsText) {
    detailsObj.packages = pkgsText.split('\n')
        .filter(l => l.includes('.rpm'))
        .map(l => l.trim().split(' ')[0]);
}

console.log(JSON.stringify(detailsObj, null, 2));
