import sys
import os
import requests
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sanitizer_logic import apply_sanitization
try:
    from docx import Document
except ImportError:
    print("python-docx not installed. Run: pip install python-docx")
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

def sanitize_docx(input_path, output_path, method):
    try:
        doc = Document(input_path)
        
        # We need to sanitize paragraph by paragraph. 
        # python-docx splits paragraphs into "runs" (formatting blocks).
        for para in doc.paragraphs:
            if not para.text.strip(): continue
            
            full_text = para.text
            detections = detect_pii(full_text)
            
            if not detections: continue
                
            # Replacing text in a DOCX paragraph across runs is very tricky because
            # entities might span multiple runs. A simpler format-preserving approach
            # for text content is to reconstruct the paragraph text with the formatting
            # matched partially, or to clear the runs and create a single new run.
            # To preserve maximum formatting while sanitizing, we will identify the exact
            # text segments and replace them inline. For this demo, we replace the 
            # paragraph text while retaining its style.
            
            # Sort in reverse to replace from end to beginning
            detections.sort(key=lambda x: x['start'], reverse=True)
            
            sanitized = full_text
            for det in detections:
                start = det['start']
                end = det['end']
                label = det['label']
                sanitized = sanitized[:start] + apply_sanitization(sanitized[start:end], label, method) + sanitized[end:]
            
            para.text = sanitized
            
        doc.save(output_path)
        print("Success")
    except Exception as e:
        print(f"Failed to process DOCX: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python docx_sanitizer.py <input_path> <output_path> <method>", file=sys.stderr)
        sys.exit(1)
        
    sanitize_docx(sys.argv[1], sys.argv[2], sys.argv[3])
