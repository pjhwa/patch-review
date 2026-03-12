import urllib.request, json
try:
    url_prep = 'http://localhost:3001/api/pipeline/stage/preprocessed?product=redhat'
    url_rev = 'http://localhost:3001/api/pipeline/stage/reviewed?product=redhat'
    
    with urllib.request.urlopen(url_prep, timeout=10) as resp:
        p_data = json.loads(resp.read()).get('data', [])
    with urllib.request.urlopen(url_rev, timeout=10) as resp:
        r_data = json.loads(resp.read()).get('data', [])
        
    print(f"PREP items ({len(p_data)}):")
    for p in p_data[:5]:
        print(f"  - issueId: {p.get('issueId')} | id: {p.get('id')}")
        
    print(f"\nREV items ({len(r_data)}):")
    for r in r_data[:5]:
        print(f"  - IssueID: {r.get('IssueID')} | issueId: {r.get('issueId')}")
        
except Exception as e:
    print(f'ERROR: {e}')
