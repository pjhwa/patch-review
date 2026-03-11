import sqlite3

conn = sqlite3.connect('/home/citec/patch-review-dashboard-v2/prisma/patch-review.db')
c = conn.cursor()

try:
    c.execute("ALTER TABLE PreprocessedPatch ADD COLUMN url TEXT;")
    conn.commit()
    print("Column 'url' added successfully.")
except Exception as e:
    print(e)
