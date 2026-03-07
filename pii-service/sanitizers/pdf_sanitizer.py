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
                    method_lower = method.lower()
                    
                    if method_lower == 'redaction':
                        # Classic black box redaction
                        page.add_redact_annot(inst, fill=(0, 0, 0))
                    else:
                        # For masking and tokenization: 
                        # 1. Add a redaction to wipe the underlying text (white fill)
                        # 2. Add the replacement text on top
                        replacement_text = apply_sanitization(value, label, method)
                        page.add_redact_annot(inst, fill=(1, 1, 1)) # White out the original text
                        
                        # Calculate position to draw the new text
                        # Using the bottom-left of the bounding box as roughly the baseline
                        point = fitz.Point(inst.x0, inst.y1 - 2)
                        
                        # Choose color: green for tokenization, blue/cyan for masking, to match the UI theme
                        text_color = (0, 0.7, 0) if method_lower == 'tokenization' else (0.2, 0.6, 0.9)
                        
                        # Insert the new text on top of where the redaction will occur
                        page.insert_text(point, replacement_text, fontsize=10, color=text_color)
                        
            # Apply all redactions on the page (this physically wipes the underlying text & draws the fills)
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
