import urllib.request, json
try:
    url_prep = 'http://localhost:3001/api/pipeline/stage/preprocessed?product=ceph'
    url_rev = 'http://localhost:3001/api/pipeline/stage/reviewed?product=ceph'
    
    with urllib.request.urlopen(url_prep, timeout=10) as resp:
        p_data = json.loads(resp.read()).get('data', [])
    with urllib.request.urlopen(url_rev, timeout=10) as resp:
        r_data = json.loads(resp.read()).get('data', [])
        
    print("PREP items:")
    for p in p_data:
        print(f"  - issueId: {p.get('issueId')} | id: {p.get('id')} | original_id: {p.get('original_id')} | Name: {p.get('Name')}")
        
    print("\nREV items:")
    for r in r_data:
        print(f"  - IssueID: {r.get('IssueID')} | issueId: {r.get('issueId')}")
        
except Exception as e:
    print(f'ERROR: {e}')
