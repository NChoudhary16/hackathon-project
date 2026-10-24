import os
import sys
from playwright.sync_api import sync_playwright

def render_html_to_pdf(html_path, pdf_path, landscape=False, print_background=True, format="A4", margin=None):
    if margin is None:
        margin = {"top": "15mm", "bottom": "15mm", "left": "15mm", "right": "15mm"}
        
    abs_html = os.path.abspath(html_path)
    abs_pdf = os.path.abspath(pdf_path)
    file_url = f"file:///{abs_html.replace(os.sep, '/')}"
    
    print(f"Rendering {file_url} -> {abs_pdf} ...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page()
        page.goto(file_url, wait_until="networkidle")
        
        pdf_options = {
            "path": abs_pdf,
            "format": format,
            "landscape": landscape,
            "print_background": print_background,
            "margin": margin
        }
        page.pdf(**pdf_options)
        browser.close()
    print(f"Successfully generated: {abs_pdf} ({os.path.getsize(abs_pdf):,} bytes)")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        landscape = "--landscape" in sys.argv
        render_html_to_pdf(sys.argv[1], sys.argv[2], landscape=landscape)
    else:
        print("Usage: python render_pdf.py <input.html> <output.pdf> [--landscape]")
