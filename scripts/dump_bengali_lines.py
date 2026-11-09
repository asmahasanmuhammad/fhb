#!/usr/bin/env python3
"""Dump every unique Bengali-containing line with file:line references for translation."""
import re, os, json
from collections import defaultdict

ROOT = "/home/z/my-project"
BN = re.compile(r'[\u0980-\u09FF]')

lines_map = defaultdict(list)  # line_content -> [(file, lineno)]
for d in ["src", "prisma"]:
    for dirpath, _, files in os.walk(os.path.join(ROOT, d)):
        for f in files:
            if not f.endswith((".ts", ".tsx", ".prisma")):
                continue
            p = os.path.join(dirpath, f)
            rel = os.path.relpath(p, ROOT)
            for i, line in enumerate(open(p, encoding="utf-8"), 1):
                if BN.search(line):
                    key = line.rstrip("\n")
                    lines_map[key].append((rel, i))

out = []
for content in sorted(lines_map.keys()):
    out.append({"line": content, "where": lines_map[content]})

with open("/home/z/my-project/scripts/bengali_lines.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

print(f"Unique Bengali lines: {len(out)}")
# stats: how many have {interpolation}
interp = sum(1 for o in out if "{" in o["line"])
print(f"With JSX/TS interpolation: {interp}")
