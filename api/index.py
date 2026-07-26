import sys, os, json, glob
from functools import wraps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import markdown

BASE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(BASE)

app = Flask(__name__, template_folder=os.path.join(BASE, 'templates'), static_folder=os.path.join(BASE, 'static'))
app.secret_key = os.urandom(24).hex()
app.config['UPLOAD_FOLDER'] = os.path.join(BASE, 'static', 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ADMIN_PW = generate_password_hash("pazizo2024")
SEO_DIR = os.path.join(PROJECT, 'seo')
CONTENT = {
    "bio": os.path.join(SEO_DIR, 'pazizo-bright-biography.md'),
    "linkedin": os.path.join(SEO_DIR, 'linkedin-bright-profile.md'),
    "google_business": os.path.join(SEO_DIR, 'google-my-business-description.md'),
    "social": os.path.join(SEO_DIR, 'social-media-posts.md'),
    "investor": os.path.join(SEO_DIR, 'investor-pitch-summary.md'),
    "press": os.path.join(SEO_DIR, 'press-release-template.md'),
    "faq": os.path.join(SEO_DIR, 'faq-content.md'),
    "structured_data": os.path.join(SEO_DIR, 'structured-data.json'),
}

def login_req(f):
    @wraps(f)
    def d(*a,**k):
        if not session.get("logged_in"): return redirect(url_for("login"))
        return f(*a,**k)
    return d

def read_c(t):
    p = CONTENT.get(t)
    if not p or not os.path.exists(p): return ""
    return open(p).read()

def all_c():
    r = {}
    for k,p in CONTENT.items():
        if os.path.exists(p):
            s = os.stat(p); raw = open(p).read()
            r[k] = {"path":p,"size_kb":round(s.st_size/1024,1),"word_count":len(raw.split())}
    return r

@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        if check_password_hash(ADMIN_PW, request.form.get("password","")):
            session["logged_in"] = True
            flash("Welcome!", "success")
            return redirect(url_for("dashboard"))
        flash("Invalid password", "error")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear(); return redirect(url_for("login"))

@app.route("/")
@login_req
def dashboard():
    return render_template("dashboard.html", content=all_c())

@app.route("/editor/<t>", methods=["GET","POST"])
@login_req
def editor(t):
    if t not in CONTENT: return redirect(url_for("dashboard"))
    if request.method == "POST":
        p = CONTENT[t]; os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p,'w').write(request.form.get("content",""))
        flash(f"'{t}' saved!", "success")
        return redirect(url_for("editor", content_type=t))
    return render_template("editor.html", content_type=t, content=read_c(t), is_json=(t=="structured_data"), info=all_c().get(t,{}))

@app.route("/faq")
@login_req
def faq_manager():
    c = read_c("faq"); entries = []
    if c:
        for b in c.split("\n\n"):
            l = b.strip().split("\n")
            if len(l)>=2: entries.append({"q":l[0].replace("Q: ",""),"a":l[1].replace("A: ","")})
    return render_template("faq_manager.html", entries=entries)

@app.route("/social")
@login_req
def social_manager():
    c = read_c("social"); posts = []
    if c:
        for b in c.split("\n---\n"):
            l = b.strip().split("\n"); platform="General"; text=b.strip()
            if l[0].startswith("["): platform=l[0].strip("[]"); text="\n".join(l[1:]).strip()
            posts.append({"platform":platform,"content":text})
    return render_template("social_manager.html", posts=posts)

@app.route("/seo")
@login_req
def seo_tools():
    return render_template("seo_tools.html")

@app.route("/preview/<t>")
@login_req
def preview(t):
    html = markdown.markdown(read_c(t)) if read_c(t) else "<p>No content</p>"
    return render_template("preview.html", content_type=t, html=html, raw=read_c(t))

@app.route("/api/stats")
@login_req
def api_stats():
    a = all_c()
    return jsonify({"total_files":len(a),"total_words":sum(c.get("word_count",0) for c in a.values())})

# Vercel expects `app`
