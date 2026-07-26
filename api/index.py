import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from cms_app import app

# Vercel Python serverless handler
handler = app
