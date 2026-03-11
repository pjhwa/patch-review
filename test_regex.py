import re
component = "containerd"
pkg_str = "containerd-1.7.28-0ubuntu1~24.04.2"

if pkg_str.startswith(component):
    print("Starts with component")
    m = re.match(fr'{re.escape(component)}[-_](.+)', pkg_str)
    if m:
        print("Match:", m.group(1))
    else:
        print("No match")
