import re

def get_component_name(vendor, title, summary, full_text):
    text = (title + " " + summary + " " + full_text).lower()
    text_primary = (title + " " + summary).lower()
    print(f"text_primary: {text_primary}")
    print(f"contains uek? {'uek' in text_primary}")
    
    if vendor == "Oracle":
        m = re.search(r'Oracle Linux \d+ ([\w-]+)\s', title + " " + summary)
        if m:
            print(f"match: {m.group(1)}")
            comp = m.group(1)
            if "Unbreakable" in comp or "kernel" in comp:
                comp = "kernel-uek"
            elif "microcode" in comp:
                comp = "microcode_ctl"
            return comp
            
        if "uek" in text_primary or "unbreakable enterprise kernel" in text_primary:
            comp = "kernel-uek"
            version_match = re.search(r'(\d+\.\d+)\.\d+', text_primary)
            if not version_match:
                version_match = re.search(r'(\d+\.\d+)\.\d+', text)
            kern_series = f"-v{version_match.group(1)}" if version_match else ""
            ol_ver = ""
            ver_suffix = f"-{ol_ver}" if ol_ver else ""
            return f"{comp}{kern_series}{ver_suffix}"
            
    return "other"

title = 'microcode_ctl bug fix and enhancement update'
overview = 'An update for Oracle Linux is now available for Oracle Linux 9.'
full_text = '[20250812-1.20251111.1.0.1]\n- add support for UEK7/UEK8 and ueknext kernels'

print("Returned:", get_component_name("Oracle", title, overview, full_text))
