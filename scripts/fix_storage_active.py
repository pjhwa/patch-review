#!/usr/bin/env python3
"""Fix storage category active status in main page.tsx"""
import os

page_path = os.path.expanduser('~/patch-review-dashboard-v2/src/app/page.tsx')
with open(page_path, 'r') as f:
    content = f.read()

old = "{ id: 'storage', count: 0, active: false, icon: HardDrive }"
new = "{ id: 'storage', count: 0, active: true, icon: HardDrive }"
content = content.replace(old, new)

with open(page_path, 'w') as f:
    f.write(content)

if old not in content and new in content:
    print('SUCCESS: Storage set to active=true')
else:
    print('CHECK: Please verify the change manually')
    # verify
    for i, line in enumerate(content.split('\n'), 1):
        if 'storage' in line.lower():
            print(f'  Line {i}: {line}')
