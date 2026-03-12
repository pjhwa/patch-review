#!/usr/bin/env python3
"""Verify stage/preprocessed?product=ceph returns only Ceph data"""
import urllib.request, json, sys

try:
    url = 'http://localhost:3001/api/pipeline/stage/preprocessed?product=ceph'
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read())
    count = data.get('count', 0)
    patches = data.get('data', [])
    vendors = list(set(p.get('vendor', '?') for p in patches))
    print(f'count: {count}')
    print(f'vendors: {vendors}')
    for p in patches[:3]:
        print(f"  - {p.get('issueId')} | vendor={p.get('vendor')} | component={p.get('component')}")
    if vendors == ['Ceph'] or (count == 0 and vendors == []):
        print('\nRESULT: PASS - Only Ceph data (or empty Ceph)')
    else:
        print(f'\nRESULT: FAIL - Got non-Ceph vendors: {[v for v in vendors if v != "Ceph"]}')
except Exception as e:
    print(f'ERROR: {e}')
