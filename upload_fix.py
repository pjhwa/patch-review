import sqlite3

db_path = "/home/citec/patch-review-dashboard-v2/prisma/patch-review.db"
conn = sqlite3.connect(db_path)
conn.execute("DELETE FROM PreprocessedPatch WHERE vendor='Ceph'")
conn.commit()
conn.close()
print("Successfully deleted corrupted Ceph rows from PreprocessedPatch.")
