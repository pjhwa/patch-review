import sqlite3

conn = sqlite3.connect('/home/citec/patch-review-dashboard-v2/prisma/patch-review.db')
c = conn.cursor()

print("--- PreprocessedPatch Unknown Versions ---")
try:
    c.execute("SELECT issueId, vendor, component, version FROM PreprocessedPatch WHERE version='Unknown' LIMIT 50;")
    rows = c.fetchall()
    for row in rows:
        print(row)
except Exception as e:
    print(e)
