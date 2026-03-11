import sqlite3
import os

db = os.path.expanduser("~/patch-review-dashboard-v2/prisma/patch-review.db")
conn = sqlite3.connect(db)
res = conn.execute("SELECT issueId, osVersion, version FROM PreprocessedPatch WHERE vendor='Ubuntu' LIMIT 5").fetchall()
for r in res:
    print(r)
