#!/usr/bin/env python3
"""Fix stage/[stageId]/route.ts: add Ceph vendor mapping"""
import os, re

path = os.path.expanduser('~/patch-review-dashboard-v2/src/app/api/pipeline/stage/[stageId]/route.ts')
with open(path) as f:
    content = f.read()

old = "        else if (productId === 'ubuntu') targetVendor = 'Ubuntu';"
new = "        else if (productId === 'ubuntu') targetVendor = 'Ubuntu';\n        else if (productId === 'ceph') targetVendor = 'Ceph';"

if old in content:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('SUCCESS: Added Ceph vendor mapping to stage route')
else:
    print('NOT FOUND. Current vendor lines:')
    for i, line in enumerate(content.split('\n'), 1):
        if 'targetVendor' in line or 'productId' in line:
            print(f'  L{i}: {line}')
