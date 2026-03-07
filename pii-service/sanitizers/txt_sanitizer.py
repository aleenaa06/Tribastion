import sys
import os
import requests

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sanitizer_logic import apply_sanitization

PII_SERVICE_URL = "http://localhost:5001/detect"

def sanitize_txt(input_path, output_path, method):
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            text = f.read()
            
        if text.strip():
            response = requests.post(PII_SERVICE_URL, json={"text": text}, timeout=10)
            detections = response.json().get('entities', [])
            
            # Sort in reverse to replace from end to beginning so indices don't shift
            detections.sort(key=lambda x: x['start'], reverse=True)
            
            for det in detections:
                start = det['start']
                end = det['end']
                label = det['label']
                text = text[:start] + apply_sanitization(text[start:end], label, method) + text[end:]
                
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
            
        print("Success")
    except Exception as e:
        print(f"Failed to process TXT: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python txt_sanitizer.py <input_path> <output_path> <method>", file=sys.stderr)
        sys.exit(1)
        
    sanitize_txt(sys.argv[1], sys.argv[2], sys.argv[3])
