import json
from collections import Counter

with open('/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2/patches_for_llm_review.json') as f:
    data = json.load(f)

vendors = Counter()
id_types = Counter()

for p in data:
    vid = p.get('id', '')
    vendor = p.get('Vendor', p.get('vendor', ''))
    
    if 'ELBA' in vid:
        id_types['ELBA (Oracle Bug Fix)'] += 1
    elif 'ELSA' in vid:
        id_types['ELSA (Oracle Security)'] += 1
    elif 'RHSA' in vid:
        id_types['RHSA (RedHat Security)'] += 1
    elif 'USN' in vid:
        id_types['USN (Ubuntu Security)'] += 1
    else:
        id_types[f'Other: {vid[:10]}'] += 1
    
    if vendor:
        vendors[vendor] += 1

print("=== Vendor distribution ===")
for v, c in vendors.most_common():
    print(f"  {v}: {c}")

print("\n=== ID type distribution ===")
for k, c in id_types.most_common():
    print(f"  {k}: {c}")

print(f"\nTotal patches: {len(data)}")

# Check severity of Oracle/RedHat patches
print("\n=== Oracle/RedHat severity samples ===")
for p in data:
    vid = p.get('id', '')
    if ('ELSA' in vid or 'RHSA' in vid) and p.get('severity','').lower() in ['critical','important','high']:
        print(f"  {vid} | {p.get('severity','?')} | {p.get('name',p.get('title','?'))[:60]}")
