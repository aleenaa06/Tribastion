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
    all_detections = regex_results.copy()

    for ner_det in ner_results:
        # Check if this NER detection overlaps with any regex detection
        is_duplicate = False
        for regex_det in regex_results:
            # Check for overlap
            if (ner_det['start'] < regex_det['end'] and ner_det['end'] > regex_det['start']):
                is_duplicate = True
                break

        if not is_duplicate:
            all_detections.append(ner_det)

    # Sort by start position
    all_detections.sort(key=lambda x: x['start'])

    return all_detections


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
            pii_type = det['type']
            if pii_type not in summary:
                summary[pii_type] = 0
            summary[pii_type] += 1

        return jsonify({
            'detections': detections,
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
    print("""
╔══════════════════════════════════════════════╗
║      🔍 TRIBASTION PII DETECTION SERVICE     ║
║           Regex + spaCy NER Engine            ║
╠══════════════════════════════════════════════╣
║  Server:  http://localhost:5001               ║
║  Status:  Running                             ║
╚══════════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=5001, debug=True)