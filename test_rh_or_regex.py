import re

def extract_rh_version(title, text, component):
    # Try picking it up from the title: "Red Hat build of Keycloak 26.4.10 Update"
    m = re.search(r'([\d]+\.[\d]+\.[\d]+)', title)
    if m:
        return f"{component}-{m.group(1)}"
        
    return "Unknown"

print(extract_rh_version("Red Hat Security Advisory: Red Hat build of Keycloak 26.4.10 Update", "", "keycloak"))

def extract_oracle_uek_version(component, packages, text):
    if not packages:
        return "Unknown"
    
    # Try to find a matching package in the array
    # e.g component = kernel-uek-v1.20251111-ol9
    # packages = ["microcode_ctl-20250812-1.20251111.1.0.1.el9_7.noarch"]
    
    # In earlier parsing, component name might be skewed. Let's extract straight from the package list.
    for pkg in packages:
        # microcode_ctl-20250812... -> extract version after first dash
        m = re.match(r'^([a-zA-Z0-9_+.-]+?)-([\d][a-zA-Z0-9_+.-]+)$', pkg.replace('.noarch', '').replace('.x86_64', '').replace('.src', ''))
        if m:
            return f"{m.group(1)}-{m.group(2)}"

    return "Unknown"

print(extract_oracle_uek_version("kernel-uek-v1.20251111-ol9", ["microcode_ctl-20250812-1.20251111.1.0.1.el9_7.noarch"], ""))
