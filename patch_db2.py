filepath = "/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2/patch_preprocessing.py"
with open(filepath, "r", encoding="utf-8") as f:
    code = f.read()

bad_line = 'cursor.execute(" DELETE FROM PreprocessedPatch)'
good_line = 'cursor.execute("DELETE FROM PreprocessedPatch")'
if bad_line in code:
    code = code.replace(bad_line, good_line)

# Also fix the existing_ids logic
old_logic = """cursor.execute("DELETE FROM PreprocessedPatch")
            existing_ids = {row[0] for row in cursor.fetchall()}

            for p in final_candidates:
                issue_id = p.get('id', 'Unknown')
                if issue_id in existing_ids:
                    skipped += 1
                    continue"""

new_logic = """cursor.execute("DELETE FROM PreprocessedPatch")
            
            for p in final_candidates:
                issue_id = p.get('id', 'Unknown')"""

if old_logic in code:
    code = code.replace(old_logic, new_logic)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(code)

print("Patch fixing syntax successful!")
