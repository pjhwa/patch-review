import sqlite3
import os

db = os.path.expanduser("~/patch-review-dashboard-v2/prisma/patch-review.db")
conn = sqlite3.connect(db)
res = conn.execute("SELECT issueId, component, version FROM PreprocessedPatch WHERE issueId IN ('ELBA-2026-0834', 'ELBA-2026-0860', 'ELBA-2026-1351')").fetchall()
for r in res:
    print(r)
