import sys
import os
import pandas as pd
import requests

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sanitizer_logic import apply_sanitization

PII_SERVICE_URL = "http://localhost:5001/detect"

def sanitize_text(text, method):
    if pd.isna(text) or not isinstance(text, str):
        return text
        
    try:
        response = requests.post(PII_SERVICE_URL, json={"text": text}, timeout=10)
        detections = response.json().get('entities', [])
        
        # Sort in reverse to replace from end to beginning so indices don't shift
        detections.sort(key=lambda x: x['start'], reverse=True)
        
        sanitized = text
        for det in detections:
            start = det['start']
            end = det['end']
            label = det['label']
            sanitized = sanitized[:start] + apply_sanitization(sanitized[start:end], label, method) + sanitized[end:]
            
        return sanitized
    except Exception as e:
        print(f"Error sanitizing text: {e}", file=sys.stderr)
        return text

def sanitize_csv(input_path, output_path, method):
    try:
        df = pd.read_csv(input_path)
        
        for col in df.columns:
            if df[col].dtype == object:  # Only process strings
                df[col] = df[col].apply(lambda x: sanitize_text(x, method))
                
        df.to_csv(output_path, index=False)
        print("Success")
    except Exception as e:
        print(f"Failed to process CSV: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python csv_sanitizer.py <input_path> <output_path> <method>", file=sys.stderr)
        sys.exit(1)
        
    sanitize_csv(sys.argv[1], sys.argv[2], sys.argv[3])
