#!/usr/bin/env python3
"""Keyword density analysis for Pazizo SEO collateral."""

import os
import re
import json

KEYWORDS = [
    "diesel supply Nigeria",
    "bulk diesel",
    "AGO Nigeria",
    "Pazizo Energy",
    "Pazizo Group",
    "Bright Pazizo",
    "diesel logistics Nigeria",
    "diesel delivery all 36 states",
    "reliable diesel supplier Nigeria",
    "wholesale diesel Lagos",
    "diesel Abuja",
    "industrial diesel Nigeria",
    "diesel for generators",
    "diesel supply contract Nigeria",
    "diesel for industries Nigeria",
    "Nigeria diesel company since 2014",
]

FILES = [
    "linkedin-bright-profile.md",
    "google-my-business-description.md",
    "social-media-posts.md",
    "investor-pitch-summary.md",
    "press-release-template.md",
    "faq-content.md",
    "structured-data.json",
]

base = "/root/pazizo-seo"

def normalize_text(text):
    return text.lower()

def count_keyword(text, keyword):
    """Case-insensitive count."""
    return len(re.findall(re.escape(keyword.lower()), text.lower()))

def analyze_file(filepath):
    if not os.path.exists(filepath):
        return {"error": "not found"}
    
    with open(filepath, "r") as f:
        text = f.read()
    
    # For JSON, count within string values
    if filepath.endswith(".json"):
        try:
            data = json.loads(text)
            # Extract all string values from JSON
            strings = []
            def extract_strings(obj):
                if isinstance(obj, str):
                    strings.append(obj)
                elif isinstance(obj, dict):
                    for v in obj.values():
                        extract_strings(v)
                elif isinstance(obj, list):
                    for item in obj:
                        extract_strings(item)
            extract_strings(data)
            text = " ".join(strings)
        except Exception:
            pass
    
    words = len(text.split())
    chars = len(text)
    
    keyword_counts = {}
    total_hits = 0
    for kw in KEYWORDS:
        count = count_keyword(text, kw)
        keyword_counts[kw] = count
        total_hits += count
    
    return {
        "file": os.path.basename(filepath),
        "words": words,
        "chars": chars,
        "total_keyword_hits": total_hits,
        "keyword_density": round((total_hits / max(words, 1)) * 100, 2),
        "keyword_counts": keyword_counts,
    }

print("=" * 80)
print("PAZIZO SEO COLLATERAL — KEYWORD DENSITY ANALYSIS")
print("=" * 80)

results = []
grand_total_hits = 0
grand_total_words = 0

for f in FILES:
    r = analyze_file(os.path.join(base, f))
    results.append(r)
    grand_total_hits += r.get("total_keyword_hits", 0)
    grand_total_words += r.get("words", 0)
    
    print(f"\n{'─' * 80}")
    print(f"📄 {r['file']}")
    print(f"   Words: {r['words']:,} | Chars: {r['chars']:,}")
    print(f"   Total keyword hits: {r['total_keyword_hits']} | Density: {r['keyword_density']}%")
    print(f"   Top keywords:")
    sorted_kw = sorted(r["keyword_counts"].items(), key=lambda x: x[1], reverse=True)
    for kw, count in sorted_kw:
        if count > 0:
            print(f"     ✓ '{kw}': {count}")

print(f"\n{'═' * 80}")
print(f"📊 GRAND TOTALS")
print(f"   Total words across all files: {grand_total_words:,}")
print(f"   Total keyword hits: {grand_total_hits}")
print(f"   Overall keyword density: {round((grand_total_hits / max(grand_total_words, 1)) * 100, 2)}%")
print(f"   Files created: {len(results)}")
print(f"{'═' * 80}")

# Per-keyword cumulative totals
print(f"\n{'─' * 80}")
print(f"🔑 PER-KEYWORD CUMULATIVE HITS (across all files)")
print(f"{'─' * 80}")
cumulative = {}
for r in results:
    for kw, count in r.get("keyword_counts", {}).items():
        cumulative[kw] = cumulative.get(kw, 0) + count
for kw, count in sorted(cumulative.items(), key=lambda x: x[1], reverse=True):
    bar = "█" * count
    print(f"  {count:3d}  {bar}  {kw}")
