import re

SYSTEM_CORE_COMPONENTS = ["kernel", "linux-image", "microcode", "microcode_ctl", "linux-firmware"]

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
            m2 = re.match(r'^([a-zA-Z0-9_+-]+?)[-_]([\d][a-zA-Z0-9_+.:~-]+)$', stripped)
            if m2:
                names.append(m2.group(1))

    if not names:
        return None
        
    names = list(set(names))
    names.sort(key=len)
    
    for pkg in pkgs:
        if str(pkg).endswith('.src'):
            stripped = str(pkg)[:-4]
            m = re.match(r'^([a-zA-Z0-9_+-]+?)-([\d][a-zA-Z0-9_+.:-]+)$', stripped)
            if m:
                return m.group(1)
                
    return names[0]

def get_component_name(vendor, title, summary, full_text, pkgs=None):
    if pkgs and isinstance(pkgs, list) and len(pkgs) > 0:
        base_comp = extract_base_component(pkgs)
        if base_comp:
            if vendor == "Oracle" and "uek" in base_comp:
                version_match = re.search(r'(\d+\.\d+)\.\d+', title + " " + summary)
                if not version_match:
                    version_match = re.search(r'(\d+\.\d+)\.\d+', full_text)
                kern_series = f"-v{version_match.group(1)}" if version_match else ""
                return f"kernel-uek{kern_series}"
            
            for core in SYSTEM_CORE_COMPONENTS:
                if core == base_comp or base_comp.startswith(core + "-"):
                    return core
            return base_comp
            
    # Fallbacks that should not be hit
    return "FALLBACK"

pkgs = [
    "microcode_ctl-20250812-1.20251111.1.0.1.el9_7.noarch",
    "microcode_ctl-20250812-1.20251111.1.0.1.el9_7.src"
]
vendor = "Oracle"
title = "microcode_ctl bug fix and enhancement update"
summary = "An update for Oracle Linux is now available for Oracle Linux 9."
full_text = "[20250812-1.20251111.1.0.1]\n- add support for UEK7/UEK8 and ueknext kernels..."

print("Component:", get_component_name(vendor, title, summary, full_text, pkgs))
