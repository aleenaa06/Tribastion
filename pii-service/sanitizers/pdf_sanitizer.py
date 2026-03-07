import sys
import os
import requests
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sanitizer_logic import apply_sanitization
try:
    import fitz  # PyMuPDF
except ImportError:
    print("PyMuPDF not installed. Run: pip install PyMuPDF")
    sys.exit(1)

PII_SERVICE_URL = "http://localhost:5001/detect"

def detect_pii(text):
    if not text.strip():
        return []
    try:
        response = requests.post(PII_SERVICE_URL, json={"text": text}, timeout=10)
        return response.json().get('entities', [])
    except Exception as e:
        print(f"Error detecting PII: {e}", file=sys.stderr)
        return []

def sanitize_pdf(input_path, output_path, method):
    try:
        doc = fitz.open(input_path)
        
        for page in doc:
            text = page.get_text("text")
            detections = detect_pii(text)
            
            for det in detections:
                value = det['text']
                label = det['label']
                
                # Search for the exact string value on the page
                text_instances = page.search_for(value)
                
                    # Redact each instance found
                for inst in text_instances:
                    # Draw a black rectangle only for 'redaction' method
                    fill_color = (0, 0, 0) if method.lower() == 'redaction' else None
                    
                    # Add a redaction annotation over the text
                    page.add_redact_annot(inst, text=apply_sanitization(value, label, method), fill=fill_color, text_color=(0,0,0))
            
            # Apply all redactions on the page
            page.apply_redactions()
            
        doc.save(output_path, garbage=4, deflate=True, clean=True)
        print("Success")
    except Exception as e:
        print(f"Failed to process PDF: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python pdf_sanitizer.py <input_path> <output_path> <method>", file=sys.stderr)
        sys.exit(1)
        
    sanitize_pdf(sys.argv[1], sys.argv[2], sys.argv[3])
