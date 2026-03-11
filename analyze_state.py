import sqlite3, json, os

DB = '/home/citec/patch-review-dashboard-v2/patch-review.db'
BATCH_DIR = '/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2/batch_data'

conn = sqlite3.connect(DB)
c = conn.cursor()
c.execute('SELECT issueId, vendor, component, version, severity, releaseDate, description, url FROM PreprocessedPatch LIMIT 15')
rows = c.fetchall()
print("=== PreprocessedPatch sample (15 rows) ===")
for r in rows:
    print(json.dumps({
        'issueId': r[0], 'vendor': r[1], 'comp': r[2],
        'ver': r[3], 'sev': r[4], 'date': r[5],
        'has_desc': bool(r[6] and len(r[6]) > 5),
        'has_url': bool(r[7])
    }))

# Count stats
c.execute("SELECT COUNT(*) FROM PreprocessedPatch WHERE version='Unknown' OR version IS NULL OR version=''")
unknown_v = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM PreprocessedPatch WHERE description IS NULL OR description=''")
no_desc = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM PreprocessedPatch WHERE url IS NULL OR url=''")
no_url = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM PreprocessedPatch WHERE severity IS NULL OR severity=''")
no_sev = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM PreprocessedPatch")
total = c.fetchone()[0]
print(f"\n=== Stats (total={total}) ===")
print(f"Unknown version: {unknown_v}/{total}")
print(f"Missing description: {no_desc}/{total}")
print(f"Missing url: {no_url}/{total}")
print(f"Missing severity: {no_sev}/{total}")
conn.close()

# Sample a RedHat batch JSON to see its structure
import glob
rh_files = glob.glob(os.path.join(BATCH_DIR, 'RHSA-*.json'))[:2]
for f in rh_files:
    with open(f) as fp:
        d = json.load(fp)
    print(f"\n=== {os.path.basename(f)} keys: {list(d.keys())}")
    for k in ['ref_url', 'url', 'severity', 'date', 'summary', 'full_text']:
        val = d.get(k, 'MISSING')
        print(f"  {k}: {str(val)[:100]}")
