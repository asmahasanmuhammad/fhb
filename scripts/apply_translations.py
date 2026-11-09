#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Apply Bengali→English line translations across src/ and prisma/ (excluding src/lib/format.ts)."""
import json, os, re, sys, importlib.util

ROOT = "/home/z/my-project"
BN = re.compile(r'[\u0980-\u09FF]')
SKIP_FILES = {"src/lib/format.ts"}  # fully rewritten manually

# ── load batches ──
TR = {}
for name in ["a", "b", "c", "d", "e"]:
    spec = importlib.util.spec_from_file_location(f"tr_{name}", f"{ROOT}/scripts/tr/{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for k, v in mod.D.items():
        if k in TR:
            print(f"WARN: duplicate index {k}")
        TR[k] = v

# ── load original line inventory ──
data = json.load(open(f"{ROOT}/scripts/bengali_lines.json", encoding="utf-8"))
idx_to_line = {i: o["line"] for i, o in enumerate(data)}          # original raw line (no \n)
orig_to_idx = {}
for i, o in enumerate(data):
    key = o["line"].strip()
    if key not in orig_to_idx:
        orig_to_idx[key] = i

# coverage check (excluding format.ts entries)
need, missing = [], []
for i, o in enumerate(data):
    files = {w[0] for w in o["where"]}
    if files & {f for f in SKIP_FILES} and not (files - {f for f in SKIP_FILES}):
        continue  # only in format.ts
    need.append(i)
    if i not in TR:
        missing.append((i, o["line"].strip()[:100], sorted(files)))
if missing:
    print(f"MISSING {len(missing)} translations:")
    for m in missing[:40]:
        print("  ", m)
    sys.exit(1)
print(f"Coverage OK: {len(need)} lines translated, {len(TR)} entries total")

# ── apply ──
changed_files, missed_lines = {}, []
for rel, indices in [(rel, None) for rel in sorted({w[0] for o in data for w in o["where"]})]:
    if rel in SKIP_FILES:
        continue
    path = os.path.join(ROOT, rel)
    lines = open(path, encoding="utf-8").read().split("\n")
    n = 0
    for li, line in enumerate(lines):
        if not BN.search(line):
            continue
        key = line.rstrip("\n").strip()
        idx = orig_to_idx.get(key)
        if idx is None:
            missed_lines.append((rel, li + 1, key[:120]))
            continue
        indent = line[:len(line) - len(line.lstrip())]
        # preserve trailing content after original stripped key? original key == full stripped line
        lines[li] = indent + TR[idx]
        n += 1
    if n:
        open(path, "w", encoding="utf-8").write("\n".join(lines))
        changed_files[rel] = n

print(f"\nChanged {len(changed_files)} files, {sum(changed_files.values())} lines:")
for f, n in sorted(changed_files.items()):
    print(f"  {f}: {n}")
if missed_lines:
    print(f"\nUNMATCHED lines ({len(missed_lines)}):")
    for m in missed_lines[:30]:
        print("  ", m)
