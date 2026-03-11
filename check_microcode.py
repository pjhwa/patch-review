import sqlite3
import os
import json

db = os.path.expanduser("~/patch-review-dashboard-v2/prisma/patch-review.db")
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row

print("=== PreprocessedPatch ===")
res = conn.execute("SELECT issueId, component, version, description FROM PreprocessedPatch WHERE component LIKE '%microcode%' OR component LIKE '%uek%'").fetchall()
for r in res:
    print(dict(r))
