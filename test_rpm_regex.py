import re

packages = [
    "openssl-libs-1:3.5.1-7.el9_7.aarch64",
    "openssl-devel-1:3.5.1-7.el9_7.aarch64",
    "openssl-1:3.5.1-7.el9_7.x86_64",
    "fence-agents-0:4.2.1-129.el8_10.21.src",
    "microcode_ctl-20250812-1.20251111.1.0.1.el9_7.noarch"
]

component = "openssl"

# ARCHes to strip:
arch_exts = ['.x86_64', '.aarch64', '.src', '.noarch', '.i686', '.s390x', '.ppc64le']

def get_best_match(pkgs, comp):
    best_ver = ""
    # pass 1: exact match
    for pkg in pkgs:
        stripped = pkg
        for ext in arch_exts:
            if stripped.endswith(ext):
                stripped = stripped[:-len(ext)]
                break
        
        # Match name-version-release where version starts with digit
        m = re.match(r'^([a-zA-Z0-9_+-]+?)-([\d][a-zA-Z0-9_+.:-]+)$', stripped)
        if m:
            name = m.group(1)
            ver = m.group(2)
            if name == comp:
                return f"{name}-{ver}"
    
    # pass 2: prefix match
    for pkg in pkgs:
        stripped = pkg
        for ext in arch_exts:
            if stripped.endswith(ext):
                stripped = stripped[:-len(ext)]
                break
                
        m = re.match(r'^([a-zA-Z0-9_+-]+?)-([\d][a-zA-Z0-9_+.:-]+)$', stripped)
        if m:
            name = m.group(1)
            ver = m.group(2)
            if name.startswith(comp):
                return f"{name}-{ver}"
                
    return best_ver

print("openssl:", get_best_match(packages, "openssl"))
print("fence-agents:", get_best_match(packages, "fence-agents"))
print("microcode_ctl:", get_best_match(packages, "microcode_ctl"))
