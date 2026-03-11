import sqlite3
import os

db = os.path.expanduser("~/patch-review-dashboard-v2/prisma/patch-review.db")
conn = sqlite3.connect(db)

print("=== PreprocessedPatch ===")
res = conn.execute("SELECT issueId, component, version FROM PreprocessedPatch WHERE component LIKE '%microcode%' OR component LIKE '%uek%'").fetchall()
for r in res:
    print(r)
