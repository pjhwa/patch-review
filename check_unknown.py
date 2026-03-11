import sqlite3
import os

db_path = os.path.expanduser("~/patch-review-dashboard-v2/prisma/patch-review.db")
if not os.path.exists(db_path):
    print("DB not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT vendor, issueId, component, version, osVersion FROM PreprocessedPatch WHERE version='Unknown' OR osVersion='Unknown' OR component='Unknown'")
    records = cursor.fetchall()
    print(f"Total Unknown records: {len(records)}")
    for r in records[:20]:
        print(f"Vendor: {r[0]}, ID: {r[1]}, Component: {r[2]}, Version: {r[3]}, OS: {r[4]}")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
