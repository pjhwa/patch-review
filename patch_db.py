import re

filepath = "/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2/patch_preprocessing.py"
with open(filepath, "r", encoding="utf-8") as f:
    code = f.read()

# Replace the entire Step 4 block
step_4_regex = r"# --- Step 4: Save to SQLite Database .*?print\(f\"\[DB SUCCESS\].*?}\"\)"
# Actually, I can use a simpler replacement
old_code_start = """            # Fetch the set of already-stored issueIds to avoid duplicates
            cursor.execute('DELETE FROM PreprocessedPatch')
            existing_ids = {row[0] for row in cursor.fetchall()}

            for p in final_candidates:
                issue_id = p.get('id', 'Unknown')
                if issue_id in existing_ids:
                    skipped += 1
                    continue"""

new_code = """            cursor.execute('DELETE FROM PreprocessedPatch')
            existing_ids = set()

            for p in final_candidates:
                issue_id = p.get('id', 'Unknown')"""

if old_code_start in code:
    code = code.replace(old_code_start, new_code)
else:
    # Try the original
    orig_code_start = """            # Fetch the set of already-stored issueIds to avoid duplicates
            cursor.execute('SELECT issueId FROM PreprocessedPatch')
            existing_ids = {row[0] for row in cursor.fetchall()}

            for p in final_candidates:
                issue_id = p.get('id', 'Unknown')
                if issue_id in existing_ids:
                    skipped += 1
                    continue"""
    if orig_code_start in code:
        code = code.replace(orig_code_start, new_code)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(code)

print("Patched DB logic!")
