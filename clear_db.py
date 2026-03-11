import sqlite3

db_path = '/home/citec/patch-review-dashboard-v2/patch-review.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("DELETE FROM PreprocessedPatch")
conn.commit()
print("Deleted all rows from PreprocessedPatch.")
conn.close()
