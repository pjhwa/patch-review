import json

with open('/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2/patches_for_llm_review.json') as f:
    data = json.load(f)

print("=== RedHat/Oracle Security Patches (RHSA/ELSA) - Summary ===\n")
for p in data:
    vid = p.get('id', '')
    if 'ELSA' in vid or 'RHSA' in vid:
        name = p.get('name', p.get('title', 'N/A'))[:80]
        severity = p.get('severity', 'N/A')
        diff = p.get('diff_summary', p.get('diff_content',''))[:300]
        print(f"ID:       {vid}")
        print(f"Severity: {severity}")
        print(f"Name:     {name}")
        print(f"Summary:  {diff[:200]}")
        print("-" * 60)
