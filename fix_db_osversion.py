import sqlite3

db_path = "/home/citec/patch-review-dashboard-v2/prisma/patch-review.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE PreprocessedPatch ADD COLUMN osVersion TEXT;")
    print("Column 'osVersion' added successfully to PreprocessedPatch.")
except Exception as e:
    print(e)
    
try:
    c.execute("ALTER TABLE ReviewedPatch ADD COLUMN osVersion TEXT;")
    print("Column 'osVersion' added successfully to ReviewedPatch.")
except Exception as e:
    print(e)
    
conn.commit()
