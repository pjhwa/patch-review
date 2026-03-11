import sqlite3
import os

db_path = os.path.expanduser("~/patch-review-dashboard-v2/prisma/patch-review.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("DELETE FROM PreprocessedPatch")
c.execute("DELETE FROM RawPatch")
c.execute("DELETE FROM ReviewedPatch")
conn.commit()
conn.close()
print("Flushed entire DB to regenerate precise versions.")
