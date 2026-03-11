#!/usr/bin/env python3
"""Remove skipDuplicates from queue.ts Ceph section (Prisma version incompatibility)"""
path = '/home/citec/patch-review-dashboard-v2/src/lib/queue.ts'
with open(path) as f:
    c = f.read()
c = c.replace(',\n                                    skipDuplicates: true', '')
c = c.replace('                                    skipDuplicates: true,\n', '')
c = c.replace('skipDuplicates: true,', '')
c = c.replace('skipDuplicates: true', '')
with open(path, 'w') as f:
    f.write(c)
if 'skipDuplicates' not in c:
    print('SUCCESS: skipDuplicates removed')
else:
    print('PARTIAL: still found skipDuplicates in file')
