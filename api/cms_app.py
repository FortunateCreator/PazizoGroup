"""Pazizo CMS — Vercel-compatible Flask app"""
import os, sys, json, glob
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import markdown

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(BASE))

app = Flask(__name__, template_folder=os.path.join(BASE, 'templates'), static_folder=os.path.join(BASE, 'static'))
app.secret_key = os.urandom(24).hex()
app.config['UPLOAD_FOLDER'] = os.path.join(BASE, 'static', 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ADMIN_PASSWORD_HASH = generate_password_hash("pazizo2024")

SEO_DIR = os.path.join(os.path.dirname(BASE), 'seo')
CONTENT_PATHS = {
    "bio": os.path.join(SEO_DIR, 'pazizo-bright-biography.md'),
    "linkedin": os.path.join(SEO_DIR, 'linkedin-bright-profile.md'),
    "google_business": os.path.join(SEO_DIR, 'google-my-business-description.md'),
    "social": os.path.join(SEO_DIR, 'social-media-posts.md'),
    "investor": os.path.join(SEO_DIR, 'investor-pitch-summary.md'),
    "press": os.path.join(SEO_DIR, 'press-release-template.md'),
    "faq": os.path.join(SEO_DIR, 'faq-content.md'),
    "structured_data": os.path.join(SEO_DIR, 'structured-data.json'),
}

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated

def read_content(content_type):
    path = CONTENT_PATHS.get(content_type)
    if not path or not os.path.exists(path):
        return ""
    with open(path) as f:
        return f.read()

def write_content(content_type, content):
    path = CONTENT_PATHS.get(content_type)
    if not path:
        return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    return True

def get_all_content():
    results = {}
    for key, path in CONTENT_PATHS.items():
        if os.path.exists(path):
            stat = os.stat(path)
            raw = open(path).read()
            results[key] = {"path": path, "size_kb": round(stat.st_size / 1024, 1), "word_count": len(raw.split())}
    return results

def get_profile_image():
    for pat in ["bright-profile.*", "bright.*", "profile.*"]:
        matches = glob.glob(os.path.join(app.config['UPLOAD_FOLDER'], pat))
        if matches:
            return "/static/uploads/" + os.path.basename(matches[0])
    return None

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if check_password_hash(ADMIN_PASSWORD_HASH, request.form.get("password", "")):
            session["logged_in"] = True
            flash("Welcome back!", "success")
            return redirect(url_for("dashboard"))
        flash("Invalid password", "error")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/")
@login_required
def dashboard():
    content = get_all_content()
    return render_template("dashboard.html", content=content, profile_img=get_profile_image())

@app.route("/landing")
def landing():
    return render_template("landing.html")

@app.route("/editor/<content_type>", methods=["GET", "POST"])
@login_required
def editor(content_type):
    if content_type not in CONTENT_PATHS:
        flash("Unknown content type", "error")
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        if write_content(content_type, request.form.get("content", "")):
            flash(f"'{content_type}' saved!", "success")
        else:
            flash("Error saving", "error")
        return redirect(url_for("editor", content_type=content_type))
    content = read_content(content_type)
    info = get_all_content().get(content_type, {})
    return render_template("editor.html", content_type=content_type, content=content, is_json=(content_type=="structured_data"), info=info)

@app.route("/faq")
@login_required
def faq_manager():
    content = read_content("faq")
    entries = []
    if content:
        for block in content.split("\n\n"):
            lines = block.strip().split("\n")
            if len(lines) >= 2:
                entries.append({"q": lines[0].replace("Q: ", ""), "a": lines[1].replace("A: ", "")})
    return render_template("faq_manager.html", entries=entries)

@app.route("/social")
@login_required
def social_manager():
    content = read_content("social")
    posts = []
    if content:
        for block in content.split("\n---\n"):
            lines = block.strip().split("\n")
            platform = "General"
            text = block.strip()
            if lines[0].startswith("["):
                platform = lines[0].strip("[]")
                text = "\n".join(lines[1:]).strip()
            posts.append({"platform": platform, "content": text})
    return render_template("social_manager.html", posts=posts)

@app.route("/upload", methods=["GET", "POST"])
@login_required
def upload_image():
    if request.method == "POST":
        if "image" not in request.files:
            flash("No file selected", "error")
            return redirect(url_for("upload_image"))
        file = request.files["image"]
        if file.filename and "." in file.filename and file.filename.rsplit(".",1)[1].lower() in {"png","jpg","jpeg","gif","webp","svg"}:
            for old in glob.glob(os.path.join(app.config['UPLOAD_FOLDER'], "bright-profile.*")):
                os.remove(old)
            ext = file.filename.rsplit(".", 1)[1].lower()
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], f"bright-profile.{ext}"))
            flash("Uploaded!", "success")
        else:
            flash("Invalid file type", "error")
        return redirect(url_for("upload_image"))
    return render_template("upload.html", profile_img=get_profile_image()) if os.path.exists(os.path.join(BASE, 'templates', 'upload.html')) else ("<h1>Upload</h1><p>Profile: "+str(get_profile_image())+"</p>")

@app.route("/seo")
@login_required
def seo_tools():
    return render_template("seo_tools.html") if os.path.exists(os.path.join(BASE, 'templates', 'seo_tools.html')) else ("<h1>SEO Tools</h1>")

@app.route("/preview/<content_type>")
@login_required
def preview(content_type):
    content = read_content(content_type)
    html = markdown.markdown(content) if content else "<p>No content</p>"
    return render_template("preview.html", content_type=content_type, html=html, raw=content) if os.path.exists(os.path.join(BASE, 'templates', 'preview.html')) else (f"<h1>{content_type}</h1>{html}")

@app.route("/api/content/<content_type>")
@login_required
def api_get_content(content_type):
    return jsonify({"content": read_content(content_type)})

@app.route("/api/stats")
@login_required
def api_stats():
    all_content = get_all_content()
    total_words = sum(c.get("word_count", 0) for c in all_content.values())
    return jsonify({"total_files": len(all_content), "total_words": total_words})

# Vercel serverless handler
handler = app
