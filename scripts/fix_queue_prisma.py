#!/usr/bin/env python3
"""Fix Prisma upsert in queue.ts - PreprocessedPatch has no unique issueId, use create pattern"""
import re

path = '/home/citec/patch-review-dashboard-v2/src/lib/queue.ts'
with open(path, 'r') as f:
    content = f.read()

# Fix PreprocessedPatch upsert to use createMany/deleteMany pattern (already have deleteMany above)
old = """                            await prisma.preprocessedPatch.deleteMany({ where: { vendor: 'Ceph' } });
                            for (const p of cephPatchesRaw) {
                                await prisma.preprocessedPatch.upsert({
                                    where: { issueId: p.patch_id },
                                    update: { vendor: 'Ceph', component: p.component || 'ceph', version: p.version || '', osVersion: p.os_version || null, description: (p.description || '').slice(0, 4000), releaseDate: p.issued_date || null },
                                    create: { issueId: p.patch_id, vendor: 'Ceph', component: p.component || 'ceph', version: p.version || '', osVersion: p.os_version || null, description: (p.description || '').slice(0, 4000), releaseDate: p.issued_date || null },
                                });
                            }
                            await job.log(`[CEPH-DB] Preprocessed ${cephPatchesRaw.length} patches ingested.`);"""

new = """                            await prisma.preprocessedPatch.deleteMany({ where: { vendor: 'Ceph' } });
                            if (cephPatchesRaw.length > 0) {
                                await prisma.preprocessedPatch.createMany({
                                    data: cephPatchesRaw.map((p: any) => ({
                                        issueId: p.patch_id,
                                        vendor: 'Ceph',
                                        component: p.component || 'ceph',
                                        version: p.version || '',
                                        osVersion: p.os_version || null,
                                        description: (p.description || '').slice(0, 4000),
                                        releaseDate: p.issued_date || null,
                                    })),
                                    skipDuplicates: true,
                                });
                            }
                            await job.log(`[CEPH-DB] Preprocessed ${cephPatchesRaw.length} patches ingested.`);"""

if old in content:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('SUCCESS: Fixed PreprocessedPatch createMany')
else:
    print('NOT FOUND: Pattern not matched, checking...')
    # Find the problematic upsert section
    idx = content.find('issueId: p.patch_id')
    if idx > 0:
        print(f'Found issueId: p.patch_id at pos {idx}')
        print(repr(content[idx-100:idx+200]))
    else:
        print('Pattern not found at all')
