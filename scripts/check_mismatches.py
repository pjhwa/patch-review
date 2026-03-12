import urllib.request, json
try:
    for product in ['ceph', 'redhat', 'ubuntu', 'oracle']:
        url_prep = f'http://localhost:3001/api/pipeline/stage/preprocessed?product={product}'
        url_rev = f'http://localhost:3001/api/pipeline/stage/reviewed?product={product}'
        
        with urllib.request.urlopen(url_prep, timeout=10) as resp:
            p_data = json.loads(resp.read()).get('data', [])
        with urllib.request.urlopen(url_rev, timeout=10) as resp:
            r_data = json.loads(resp.read()).get('data', [])
            
        p_ids = [p.get('issueId') or p.get('id') or p.get('original_id') or p.get('Name') for p in p_data]
        r_ids = [r.get('IssueID') or r.get('Issue ID') or r.get('Issue_ID') for r in r_data]
        
        print(f"--- Product: {product} ---")
        print(f"PREP count: {len(p_ids)}, REV count: {len(r_ids)}")
        
        # Simulate frontend logic
        approved_in_prep = [pid for pid in p_ids if pid in r_ids]
        missing_in_prep = [rid for rid in r_ids if rid not in p_ids]
        
        print(f"Matched (Blue Highlight in PREP): {len(approved_in_prep)}")
        if len(approved_in_prep) != len(r_ids):
            print(f"MISMATCH! REV has {len(r_ids)} items, but only {len(approved_in_prep)} are highlighted.")
            print(f"REV items not found in PREP: {missing_in_prep}")
        
except Exception as e:
    print(f'ERROR: {e}')
