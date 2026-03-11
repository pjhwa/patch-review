import re

pkgs_oracle = [
    "389-ds-base-1.4.3.39-20.module+el8.10.0+90771+b7e7eb39.src",
    "python3-lib389-1.4.3.39-20.module+el8.10.0+90771+b7e7eb39.noarch",
    "389-ds-base-libs-1.4.3.39-20.module+el8.10.0+90771+b7e7eb39.x86_64",
    "389-ds-base-devel-1.4.3.39-20.module+el8.10.0+90771+b7e7eb39.x86_64",
]

pkgs_ubuntu = [
    "containerd-1.7.28-0ubuntu1~24.04.2",
    "containerd-app-1.7.28-0ubuntu1~24.04.2"
]

def extract_base_component(pkgs):
    arch_exts = ['.x86_64', '.aarch64', '.src', '.noarch', '.i686', '.s390x', '.ppc64le']
    names = []
    for pkg in pkgs:
        stripped = str(pkg)
        for ext in arch_exts:
            if stripped.endswith(ext):
                stripped = stripped[:-len(ext)]
                break
        
        m = re.match(r'^([a-zA-Z0-9_+-]+?)-([\d][a-zA-Z0-9_+.:-]+)$', stripped)
        if m:
            names.append(m.group(1))
        else:
            # Maybe ubuntu like containerd_1.7.28
            m2 = re.match(r'^([a-zA-Z0-9_+-]+?)[-_]([\d][a-zA-Z0-9_+.:~-]+)$', stripped)
            if m2:
                names.append(m2.group(1))
    
    if not names:
        return None
        
    # Find the shortest name. It's usually the base package without -devel, -libs, etc.
    names = list(set(names))
    # Additionally, sort by length.
    names.sort(key=len)
    
    # Check if there is a .src rpm, its name is usually the true base
    for pkg in pkgs:
        if str(pkg).endswith('.src'):
            stripped = str(pkg)[:-4]
            m = re.match(r'^([a-zA-Z0-9_+-]+?)-([\d][a-zA-Z0-9_+.:-]+)$', stripped)
            if m:
                return m.group(1)
                
    return names[0]

print("Oracle Base:", extract_base_component(pkgs_oracle))
print("Ubuntu Base:", extract_base_component(pkgs_ubuntu))
