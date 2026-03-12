import sqlite3

db_path = "/home/citec/patch-review-dashboard-v2/prisma/patch-review.db"
conn = sqlite3.connect(db_path)

# Node.js inserted row
print("Node.js inserted (Red Hat):")
for row in conn.execute("SELECT collectedAt FROM PreprocessedPatch WHERE vendor='Red Hat' LIMIT 1"):
    print(repr(row[0]))

# Python inserted row
print("\nPython inserted (Ceph):")
for row in conn.execute("SELECT collectedAt FROM PreprocessedPatch WHERE vendor='Ceph' LIMIT 1"):
    print(repr(row[0]))

conn.close()
