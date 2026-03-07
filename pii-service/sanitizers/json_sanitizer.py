import sys
import os
import json
import requests

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sanitizer_logic import apply_sanitization

PII_SERVICE_URL = "http://localhost:5001/detect"

def sanitize_text(text, method):
    if not isinstance(text, str):
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

def sanitize_json(data, method):
    if isinstance(data, dict):
        return {k: sanitize_json(v, method) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json(v, method) for v in data]
    elif isinstance(data, str):
        return sanitize_text(data, method)
    else:
        return data

def process_file(input_path, output_path, method):
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        sanitized_data = sanitize_json(data, method)
            
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(sanitized_data, f, indent=2)
            
        print("Success")
    except Exception as e:
        print(f"Failed to process JSON: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python json_sanitizer.py <input_path> <output_path> <method>", file=sys.stderr)
        sys.exit(1)
        
    process_file(sys.argv[1], sys.argv[2], sys.argv[3])
