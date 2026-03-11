import sqlite3

db_path = "/home/citec/patch-review-dashboard-v2/patch-review.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE PreprocessedPatch ADD COLUMN url TEXT;")
    conn.commit()
    print("Column 'url' added successfully to correct root DB.")
except Exception as e:
    print(e)
