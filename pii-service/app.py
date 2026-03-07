"""
Tribastion PII Detection Microservice
Flask API that detects PII using regex patterns and spaCy NER.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from detectors.regex_detector import detect_with_regex
from detectors.ner_detector import detect_with_ner

app = Flask(__name__)
CORS(app)


def merge_detections(regex_results, ner_results):
    """Merge and deduplicate detections from regex and NER."""
    # Combine all results. Regex results come first so they take priority 
    # if there is an exact overlap (regexes are generally more precise than NER).
    all_results = regex_results + ner_results

    deduplicated = []
    
    for det in all_results:
        is_duplicate = False
        for saved_det in deduplicated:
            # Check for overlap
            if (det['start'] < saved_det['end'] and det['end'] > saved_det['start']):
                is_duplicate = True
                break
                
        if not is_duplicate:
            deduplicated.append(det)

    # Sort by start position for subsequent processing
    deduplicated.sort(key=lambda x: x['start'])

    return deduplicated


@app.route('/detect', methods=['POST'])
def detect_pii():
    """Detect PII in the given text."""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400

        text = data['text']

        # Run both detection methods
        regex_results = detect_with_regex(text)
        ner_results = detect_with_ner(text)

        # Merge and deduplicate
        detections = merge_detections(regex_results, ner_results)

        # Summary
        summary = {}
        for det in detections:
            pii_type = det['label']
            if pii_type not in summary:
                summary[pii_type] = 0
            summary[pii_type] += 1

        return jsonify({
            'entities': detections,
            'total': len(detections),
            'summary': summary,
            'methods_used': ['regex', 'ner']
        })

    except Exception as e:
        print(f"Error during PII detection: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'service': 'Tribastion PII Detection Service'
    })


if __name__ == '__main__':
    print("=== TRIBASTION PII DETECTION SERVICE ===")
    print("Server: http://localhost:5001")
    print("Status: Running")
    print("=========================================")
    app.run(host='0.0.0.0', port=5001, debug=True)