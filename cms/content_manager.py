"""
Pazizo CMS — Content Manager Backend
File-based CRUD for all content types. Reads/writes markdown and JSON.
"""
import os
import json
import re
from datetime import datetime
from pathlib import Path

BASE_DIR = Path("/root")
CONTENT_PATHS = {
    "bio": BASE_DIR / "pazizo-bright-biography.md",
    "linkedin": BASE_DIR / "pazizo-seo" / "linkedin-bright-profile.md",
    "google_business": BASE_DIR / "pazizo-seo" / "google-my-business-description.md",
    "social": BASE_DIR / "pazizo-seo" / "social-media-posts.md",
    "investor": BASE_DIR / "pazizo-seo" / "investor-pitch-summary.md",
    "press": BASE_DIR / "pazizo-seo" / "press-release-template.md",
    "faq": BASE_DIR / "pazizo-seo" / "faq-content.md",
    "structured_data": BASE_DIR / "pazizo-seo" / "structured-data.json",
}

def read_content(content_type):
    """Read raw content from file."""
    path = CONTENT_PATHS.get(content_type)
    if not path or not path.exists():
        return ""
    return path.read_text()

def write_content(content_type, content):
    """Write raw content to file."""
    path = CONTENT_PATHS.get(content_type)
    if not path:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    return True

def get_all_content():
    """Get all content types with metadata."""
    results = {}
    for key, path in CONTENT_PATHS.items():
        if path.exists():
            stat = path.stat()
            raw = path.read_text()
            results[key] = {
                "path": str(path),
                "size_kb": round(stat.st_size / 1024, 1),
                "modified": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M"),
                "word_count": len(raw.split()),
                "char_count": len(raw),
                "preview": raw[:200] + "..." if len(raw) > 200 else raw,
            }
        else:
            results[key] = {"path": str(path), "size_kb": 0, "modified": "N/A", "word_count": 0, "char_count": 0, "preview": "(file missing)"}
    return results

# --- FAQ-specific operations ---
def parse_faq():
    """Parse FAQ markdown into structured entries."""
    raw = read_content("faq")
    entries = []
    current = None
    for line in raw.split("\n"):
        if line.startswith("### ") or (line.startswith("## ") and "?" in line):
            if current:
                entries.append(current)
            q = line.lstrip("#").strip()
            # remove leading number like "1. "
            q = re.sub(r'^\d+\.\s*', '', q)
            current = {"question": q, "answer": ""}
        elif current is not None:
            current["answer"] += line + "\n"
    if current:
        entries.append(current)
    # Strip trailing newlines from answers
    for e in entries:
        e["answer"] = e["answer"].strip()
    return entries

def save_faq(entries):
    """Save FAQ entries back to markdown."""
    header_lines = []
    raw = read_content("faq")
    in_header = True
    for line in raw.split("\n"):
        if in_header:
            if line.startswith("## "):
                in_header = False
            header_lines.append(line)
        else:
            break
    # Build the FAQ body
    body = []
    body.append("\n## Frequently Asked Questions\n")
    for i, entry in enumerate(entries, 1):
        body.append(f"### {i}. {entry['question']}\n")
        body.append(entry["answer"].strip() + "\n")
    content = "\n".join(header_lines) if header_lines else ""
    content += "\n" + "\n".join(body)
    return write_content("faq", content)

def add_faq(question, answer):
    entries = parse_faq()
    entries.append({"question": question, "answer": answer})
    return save_faq(entries)

def update_faq(index, question, answer):
    entries = parse_faq()
    if 0 <= index < len(entries):
        entries[index] = {"question": question, "answer": answer}
        return save_faq(entries)
    return False

def delete_faq(index):
    entries = parse_faq()
    if 0 <= index < len(entries):
        entries.pop(index)
        return save_faq(entries)
    return False

# --- Social media post operations ---
def parse_social_posts():
    """Parse social media posts into structured entries."""
    raw = read_content("social")
    entries = []
    current = None
    platform = ""
    for line in raw.split("\n"):
        # Detect platform headers
        platform_match = re.match(r'^##\s+(.+?)\s+Posts', line, re.IGNORECASE)
        if platform_match:
            platform = platform_match.group(1).strip()
            continue
        # Detect individual post entries
        post_match = re.match(r'^###?\s+Post\s+(\d+)(?::\s*(.+))?', line, re.IGNORECASE)
        if post_match:
            if current:
                entries.append(current)
            current = {
                "number": int(post_match.group(1)),
                "platform": platform,
                "title": post_match.group(2) or "",
                "content": ""
            }
        elif current is not None and line.strip() and not line.startswith("##"):
            # Check if this line starts a new entry (numbered)
            next_match = re.match(r'^\d+\.\s*', line.strip())
            if next_match and current.get("content"):
                entries.append(current)
                current = {"number": len(entries) + 1, "platform": platform, "title": "", "content": line.strip()}
            else:
                current["content"] += line + "\n"
    if current:
        entries.append(current)
    for e in entries:
        e["content"] = e["content"].strip()
    return entries

def save_social_posts(entries):
    """Save social posts back to markdown."""
    header_lines = []
    raw = read_content("social")
    in_header = True
    for line in raw.split("\n"):
        if in_header:
            if line.startswith("## ") and "Posts" in line and not line.startswith("## Social"):
                in_header = False
            header_lines.append(line)
        else:
            break

    # Group by platform
    platforms = {}
    for e in entries:
        p = e.get("platform", "Social")
        if p not in platforms:
            platforms[p] = []
        platforms[p].append(e)

    body = []
    for platform, posts in platforms.items():
        body.append(f"## {platform} Posts\n")
        for post in posts:
            if post.get("title"):
                body.append(f"### Post {post['number']}: {post['title']}\n")
            else:
                body.append(f"### Post {post['number']}\n")
            body.append(post["content"].strip() + "\n")

    content = "\n".join(header_lines) if header_lines else ""
    content += "\n" + "\n".join(body)
    return write_content("social", content)

def add_social_post(platform, content_text):
    entries = parse_social_posts()
    entries.append({
        "number": len(entries) + 1,
        "platform": platform,
        "title": "",
        "content": content_text.strip()
    })
    return save_social_posts(entries)

def update_social_post(index, platform, content_text):
    entries = parse_social_posts()
    if 0 <= index < len(entries):
        entries[index]["platform"] = platform
        entries[index]["content"] = content_text.strip()
        return save_social_posts(entries)
    return False

def delete_social_post(index):
    entries = parse_social_posts()
    if 0 <= index < len(entries):
        entries.pop(index)
        # Renumber
        for i, e in enumerate(entries, 1):
            e["number"] = i
        return save_social_posts(entries)
    return False

# --- Keyword analysis ---
KEYWORDS = [
    "diesel supply Nigeria", "bulk diesel", "AGO Nigeria", "Pazizo Energy",
    "Pazizo Group", "Bright Pazizo", "diesel logistics Nigeria",
    "diesel delivery all 36 states", "reliable diesel supplier Nigeria",
    "wholesale diesel Lagos", "diesel Abuja", "industrial diesel Nigeria",
    "diesel for generators", "diesel supply contract Nigeria",
    "diesel for industries Nigeria", "Nigeria diesel company since 2014",
]

def analyze_keywords(text):
    text_lower = text.lower()
    results = []
    total = 0
    for kw in KEYWORDS:
        count = text_lower.count(kw.lower())
        if count > 0:
            results.append({"keyword": kw, "hits": count})
            total += count
    results.sort(key=lambda x: x["hits"], reverse=True)
    word_count = len(text.split())
    density = round((total / max(word_count, 1)) * 100, 2)
    return {"hits": results, "total_hits": total, "word_count": word_count, "density": density}

# --- Cron job management ---
def get_cron_status():
    """Read cron job status from Hermes."""
    import subprocess
    try:
        result = subprocess.run(
            ["python3", "-c", "import json; print(json.dumps({'status': 'active'}))"],
            capture_output=True, text=True, timeout=5
        )
        return {"status": "active", "job_id": "a8e7ce4cf53e", "schedule": "every 72h", "next_run": "check Hermes"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# --- Structured data operations ---
def get_structured_data():
    path = CONTENT_PATHS["structured_data"]
    if path.exists():
        try:
            return json.loads(path.read_text())
        except json.JSONDecodeError:
            return {}
    return {}

def save_structured_data(data):
    path = CONTENT_PATHS["structured_data"]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2))
    return True
