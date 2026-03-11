import sqlite3
import os

db_path = os.path.expanduser("~/patch-review-dashboard-v2/prisma/patch-review.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("DELETE FROM PreprocessedPatch WHERE vendor='Ubuntu'")
c.execute("DELETE FROM RawPatch WHERE vendor='Ubuntu'")
c.execute("DELETE FROM ReviewedPatch WHERE vendor='Ubuntu'")
conn.commit()
conn.close()
print("Cleaned Ubuntu rows.")
