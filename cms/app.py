#!/usr/bin/env python3
"""
Pazizo CMS — Full Content Management System for Bright & Pazizo Energy
Flask-based admin panel for managing all SEO content, social posts, FAQs,
structured data, and the automated content engine.
"""
import os
import json
import glob
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session, send_file, render_template_string
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from markdown import markdown
import content_manager as cm

app = Flask(__name__)
app.secret_key = os.urandom(24).hex()

# Simple config
ADMIN_PASSWORD_HASH = generate_password_hash("pazizo2024")  # Change this!

# Upload settings
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# SMTP config file
SMTP_CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "smtp_config.json")

# ============ Auth ============
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated

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

# ============ Dashboard ============
@app.route("/")
@login_required
def dashboard():
    content = cm.get_all_content()
    return render_template("dashboard.html", content=content)

# ============ Generic Content Editor ============
@app.route("/editor/<content_type>", methods=["GET", "POST"])
@login_required
def editor(content_type):
    if content_type not in cm.CONTENT_PATHS:
        flash("Unknown content type", "error")
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        new_content = request.form.get("content", "")
        if cm.write_content(content_type, new_content):
            flash(f"'{content_type}' saved successfully!", "success")
        else:
            flash("Error saving content", "error")
        return redirect(url_for("editor", content_type=content_type))

    content = cm.read_content(content_type)
    is_json = content_type == "structured_data"
    info = cm.get_all_content().get(content_type, {})

    return render_template("editor.html",
                         content_type=content_type,
                         content=content,
                         is_json=is_json,
                         info=info)

# ============ FAQ Manager ============
@app.route("/faq")
@login_required
def faq_manager():
    entries = cm.parse_faq()
    return render_template("faq_manager.html", entries=entries)

@app.route("/faq/add", methods=["POST"])
@login_required
def faq_add():
    question = request.form.get("question", "").strip()
    answer = request.form.get("answer", "").strip()
    if question and answer:
        if cm.add_faq(question, answer):
            flash("FAQ entry added!", "success")
        else:
            flash("Error adding FAQ", "error")
    return redirect(url_for("faq_manager"))

@app.route("/faq/edit/<int:index>", methods=["POST"])
@login_required
def faq_edit(index):
    question = request.form.get("question", "").strip()
    answer = request.form.get("answer", "").strip()
    if question and answer:
        if cm.update_faq(index, question, answer):
            flash("FAQ entry updated!", "success")
        else:
            flash("Error updating FAQ", "error")
    return redirect(url_for("faq_manager"))

@app.route("/faq/delete/<int:index>", methods=["POST"])
@login_required
def faq_delete(index):
    if cm.delete_faq(index):
        flash("FAQ entry deleted!", "success")
    else:
        flash("Error deleting FAQ", "error")
    return redirect(url_for("faq_manager"))

# ============ Social Media Manager ============
@app.route("/social")
@login_required
def social_manager():
    posts = cm.parse_social_posts()
    return render_template("social_manager.html", posts=posts)

@app.route("/social/add", methods=["POST"])
@login_required
def social_add():
    platform = request.form.get("platform", "General")
    content = request.form.get("content", "").strip()
    if content:
        if cm.add_social_post(platform, content):
            flash("Post added!", "success")
        else:
            flash("Error adding post", "error")
    return redirect(url_for("social_manager"))

@app.route("/social/edit/<int:index>", methods=["POST"])
@login_required
def social_edit(index):
    platform = request.form.get("platform", "General")
    content = request.form.get("content", "").strip()
    if content:
        if cm.update_social_post(index, platform, content):
            flash("Post updated!", "success")
        else:
            flash("Error updating post", "error")
    return redirect(url_for("social_manager"))

@app.route("/social/delete/<int:index>", methods=["POST"])
@login_required
def social_delete(index):
    if cm.delete_social_post(index):
        flash("Post deleted!", "success")
    else:
        flash("Error deleting post", "error")
    return redirect(url_for("social_manager"))

# ============ SEO Tools ============
@app.route("/seo")
@login_required
def seo_tools():
    return render_template("seo_tools.html")

@app.route("/seo/analyze", methods=["POST"])
@login_required
def seo_analyze():
    content = request.form.get("content", "")
    results = cm.analyze_keywords(content)
    return jsonify(results)

# ============ Preview ============
@app.route("/preview/<content_type>")
@login_required
def preview(content_type):
    content = cm.read_content(content_type)
    if content_type in ("structured_data",):
        try:
            parsed = json.loads(content)
            # Format nicely for preview
            content = json.dumps(parsed, indent=2)
        except json.JSONDecodeError:
            pass
    html = markdown(content) if content else "<p>No content</p>"
    return render_template("preview.html", content_type=content_type, html=html, raw=content)

# ============ API for AJAX operations ============
@app.route("/api/content/<content_type>")
@login_required
def api_get_content(content_type):
    return jsonify({"content": cm.read_content(content_type)})

@app.route("/api/analyze/<content_type>")
@login_required
def api_analyze(content_type):
    content = cm.read_content(content_type)
    results = cm.analyze_keywords(content)
    return jsonify(results)

@app.route("/api/stats")
@login_required
def api_stats():
    all_content = cm.get_all_content()
    total_words = sum(c.get("word_count", 0) for c in all_content.values())
    total_files = sum(1 for c in all_content.values() if c.get("size_kb", 0) > 0)
    return jsonify({
        "total_files": total_files,
        "total_words": total_words,
        "content": all_content
    })

# ============ Image Upload ============
def allowed_filename(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def get_profile_image():
    """Find Bright's profile image in uploads folder."""
    patterns = ["bright-profile.*", "bright.*", "profile.*"]
    for pattern in patterns:
        matches = glob.glob(os.path.join(UPLOAD_FOLDER, pattern))
        if matches:
            return "/static/uploads/" + os.path.basename(matches[0])
    return None

@app.route("/upload", methods=["GET", "POST"])
@login_required
def upload_image():
    profile_img = get_profile_image()
    if request.method == "POST":
        if "image" not in request.files:
            flash("No file selected", "error")
            return redirect(url_for("upload_image"))
        file = request.files["image"]
        if file.filename == "":
            flash("No file selected", "error")
            return redirect(url_for("upload_image"))
        if not allowed_filename(file.filename):
            flash("Invalid file type. Allowed: png, jpg, jpeg, gif, webp, svg", "error")
            return redirect(url_for("upload_image"))
        # Remove old profile images
        for old in glob.glob(os.path.join(UPLOAD_FOLDER, "bright-profile.*")):
            os.remove(old)
        for old in glob.glob(os.path.join(UPLOAD_FOLDER, "bright.*")):
            os.remove(old)
        # Save new image as bright-profile.<ext>
        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"bright-profile.{ext}"
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        flash("Profile image uploaded successfully!", "success")
        return redirect(url_for("upload_image"))
    return render_template("base.html", inline_content=render_template_string(UPLOAD_PAGE, profile_img=profile_img))

UPLOAD_PAGE = """
<h1 class="page-title">📷 Upload Profile Photo</h1>
<p class="page-subtitle">Upload Bright's profile photo for the dashboard</p>

<div class="card">
    <div class="card-title">Current Photo</div>
    {% if profile_img %}
    <div style="text-align:center; margin-bottom:16px;">
        <img src="{{ profile_img }}" alt="Bright's Profile" style="max-width:200px; border-radius:12px; border:2px solid var(--accent);">
    </div>
    <p style="color:var(--green); text-align:center;">✅ Profile photo is set</p>
    {% else %}
    <p style="color:var(--text2); text-align:center;">No profile photo uploaded yet.</p>
    {% endif %}
</div>

<div class="card">
    <div class="card-title">{% if profile_img %}Replace{% else %}Upload{% endif %} Photo</div>
    <form method="POST" enctype="multipart/form-data">
        <div class="form-group">
            <label>Choose an image (PNG, JPG, GIF, WebP, SVG)</label>
            <input type="file" name="image" accept="image/*" required>
        </div>
        <button type="submit" class="btn btn-primary">📤 Upload</button>
        <a href="/" class="btn">← Back to Dashboard</a>
    </form>
</div>
"""

# ============ PDF Export ============
@app.route("/export/<content_type>")
@login_required
def export_pdf(content_type):
    if content_type not in cm.CONTENT_PATHS:
        flash("Unknown content type", "error")
        return redirect(url_for("dashboard"))
    content = cm.read_content(content_type)
    if not content:
        flash("No content to export", "error")
        return redirect(url_for("editor", content_type=content_type))
    # Convert markdown to HTML
    html_body = markdown(content)
    title = content_type.replace("_", " ").title()
    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>{title}</title>
<style>
  body {{ font-family: -apple-system, sans-serif; line-height: 1.7; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; }}
  h1 {{ color: #d97706; font-size: 24px; }}
  h2 {{ color: #b45309; font-size: 20px; margin-top: 24px; }}
  h3 {{ font-size: 16px; margin-top: 20px; }}
  table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
  th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
  th {{ background: #f5f5f5; }}
  code {{ background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }}
  pre {{ background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }}
</style></head>
<body>{html_body}</body></html>"""
    try:
        from weasyprint import HTML
        pdf = HTML(string=html).write_pdf()
        import io
        buf = io.BytesIO(pdf)
        buf.seek(0)
        return send_file(
            buf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"{content_type}-pazizo.pdf"
        )
    except ImportError:
        flash("PDF export requires weasyprint. Install with: pip install weasyprint", "error")
        return redirect(url_for("editor", content_type=content_type))

# ============ SMTP Config Helpers ============
def load_smtp_config():
    """Load SMTP configuration from JSON file."""
    if os.path.exists(SMTP_CONFIG_FILE):
        with open(SMTP_CONFIG_FILE) as f:
            return json.load(f)
    return {}

def save_smtp_config(config):
    """Save SMTP configuration to JSON file."""
    os.makedirs(os.path.dirname(SMTP_CONFIG_FILE), exist_ok=True)
    with open(SMTP_CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

# ============ Email Distribution ============
@app.route("/email", methods=["GET", "POST"])
@login_required
def email_content():
    smtp_config = load_smtp_config()
    if request.method == "POST":
        action = request.form.get("action", "send")
        if action == "config":
            smtp_config = {
                "host": request.form.get("host", "").strip(),
                "port": int(request.form.get("port", 587)),
                "user": request.form.get("user", "").strip(),
                "password": request.form.get("password", "").strip(),
                "from_email": request.form.get("from_email", "").strip(),
            }
            save_smtp_config(smtp_config)
            flash("SMTP configuration saved!", "success")
            return redirect(url_for("email_content"))
        elif action == "send":
            to_email = request.form.get("to_email", "").strip()
            content_type = request.form.get("content_type", "").strip()
            subject = request.form.get("subject", "").strip()
            if not to_email or not content_type:
                flash("Recipient email and content type are required", "error")
                return redirect(url_for("email_content"))
            if not smtp_config or not smtp_config.get("host"):
                flash("Please configure SMTP settings first", "error")
                return redirect(url_for("email_content"))
            content = cm.read_content(content_type)
            if not content:
                flash("No content to send", "error")
                return redirect(url_for("email_content"))
            html_body = markdown(content)
            try:
                msg = MIMEMultipart("alternative")
                msg["From"] = smtp_config["from_email"]
                msg["To"] = to_email
                msg["Subject"] = subject or f"Pazizo CMS: {content_type}"
                msg.attach(MIMEText(content, "plain"))
                msg.attach(MIMEText(f"<html><body>{html_body}</body></html>", "html"))
                with smtplib.SMTP(smtp_config["host"], smtp_config["port"], timeout=30) as server:
                    server.starttls()
                    server.login(smtp_config["user"], smtp_config["password"])
                    server.send_message(msg)
                flash(f"✅ Email sent to {to_email}!", "success")
            except Exception as e:
                flash(f"❌ Failed to send email: {str(e)}", "error")
            return redirect(url_for("email_content"))
    # Build content type options
    content_options = "".join(
        f'<option value="{k}">{k.replace("_", " ").title()}</option>'
        for k in cm.CONTENT_PATHS
    )
    return render_template_string(EMAIL_PAGE,
                                  smtp_config=smtp_config,
                                  content_options=content_options)

EMAIL_PAGE = """
<h1 class="page-title">📧 Email Distribution</h1>
<p class="page-subtitle">Send content from the CMS via email</p>

<div class="card">
    <div class="card-title">⚙️ SMTP Configuration</div>
    <form method="POST">
        <input type="hidden" name="action" value="config">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
                <label>SMTP Host</label>
                <input type="text" name="host" value="{{ smtp_config.get('host', '') }}" placeholder="smtp.gmail.com">
            </div>
            <div class="form-group">
                <label>SMTP Port</label>
                <input type="number" name="port" value="{{ smtp_config.get('port', 587) }}" placeholder="587">
            </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
                <label>Username / Email</label>
                <input type="text" name="user" value="{{ smtp_config.get('user', '') }}" placeholder="your@email.com">
            </div>
            <div class="form-group">
                <label>Password / App Password</label>
                <input type="password" name="password" value="{{ smtp_config.get('password', '') }}" placeholder="••••••••">
            </div>
        </div>
        <div class="form-group">
            <label>From Email</label>
            <input type="email" name="from_email" value="{{ smtp_config.get('from_email', '') }}" placeholder="your@email.com">
        </div>
        <button type="submit" class="btn btn-primary">💾 Save SMTP Config</button>
        {% if smtp_config.get('host') %}
        <span style="color:var(--green); margin-left:12px; font-size:13px;">✅ Configured: {{ smtp_config.host }}:{{ smtp_config.port }}</span>
        {% endif %}
    </form>
</div>

<div class="card">
    <div class="card-title">✉️ Send Content via Email</div>
    <form method="POST">
        <input type="hidden" name="action" value="send">
        <div class="form-group">
            <label>Select Content</label>
            <select name="content_type" required>
                <option value="">-- Choose content --</option>
                {{ content_options|safe }}
            </select>
        </div>
        <div class="form-group">
            <label>Recipient Email</label>
            <input type="email" name="to_email" required placeholder="recipient@example.com">
        </div>
        <div class="form-group">
            <label>Subject (optional)</label>
            <input type="text" name="subject" placeholder="Pazizo CMS: Content Title">
        </div>
        <button type="submit" class="btn btn-primary" {% if not smtp_config.get('host') %}disabled{% endif %}>📧 Send Email</button>
        <a href="/" class="btn">← Back to Dashboard</a>
        {% if not smtp_config.get('host') %}
        <span style="color:var(--red); margin-left:12px; font-size:13px;">⚠ Configure SMTP settings above first</span>
        {% endif %}
    </form>
</div>
"""

# ============ Public Landing Page ============
@app.route("/landing")
def landing():
    """Public-facing SEO landing page — no authentication required."""
    return render_template("landing.html")


# ============ Error handlers ============
@app.errorhandler(404)
def not_found(e):
    return render_template("base.html", content="<h2>Page not found</h2>"), 404

# ============ Main ============
@app.context_processor
def utility_processor():
    return dict(get_profile_image=get_profile_image)

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  🚀 Pazizo CMS — Content Management System")
    print("  👤 Bright & Pazizo Energy SEO Platform")
    print("="*60)
    print(f"\n  🌐 Open: http://localhost:5050")
    print(f"  🔑 Password: pazizo2024")
    print(f"\n  📁 Content root: /root/pazizo-bright-biography.md")
    print(f"  📁 SEO assets:   /root/pazizo-seo/")
    print("\n" + "="*60 + "\n")
    app.run(host="0.0.0.0", port=5050, debug=False)
