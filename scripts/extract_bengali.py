#!/usr/bin/env python3
"""Extract all unique Bengali-containing string literals from the codebase."""
import re, json, os

ROOT = "/home/z/my-project"
TARGETS = []
for d in ["src", "prisma"]:
    for dirpath, _, files in os.walk(os.path.join(ROOT, d)):
        for f in files:
            if f.endswith((".ts", ".tsx", ".prisma")):
                TARGETS.append(os.path.join(dirpath, f))

BN = re.compile(r'[\u0980-\u09FF]')
# Match full string literals (double/single/backtick) that contain Bengali
STR_RE = re.compile(r'"((?:[^"\\\n]|\\.)*[\u0980-\u09FF](?:[^"\\\n]|\\.)*)"'   # "..."
                   r"|'((?:[^'\\\n]|\\.)*[\u0980-\u09FF](?:[^'\\\n]|\\.)*)'"   # '...'
                   r'|`((?:[^`\\$]|\\.|\$(?!\{))*[\u0980-\u09FF](?:[^`\\$]|\\.|\$(?!\{))*)`')  # `...` no ${}

seen = {}
for path in sorted(TARGETS):
    rel = os.path.relpath(path, ROOT)
    text = open(path, encoding="utf-8").read()
    for m in STR_RE.finditer(text):
        for g in m.groups():
            if g is not None and BN.search(g):
                key = g
                if key not in seen:
                    seen[key] = {"files": set()}
                seen[key]["files"].add(rel)

out = []
for k, v in sorted(seen.items()):
    out.append({"string": k, "files": sorted(v["files"])})

with open("/home/z/my-project/scripts/bengali_strings.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

print(f"Unique Bengali string literals: {len(out)}")
from collections import Counter
c = Counter()
for o in out:
    for f in o["files"]:
        c[f] += 1
print("Per-file unique strings:")
for f, n in c.most_common():
    print(f"  {f}: {n}")
