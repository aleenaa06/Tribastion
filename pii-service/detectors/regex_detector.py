import re

# Regex patterns for PII detection
PII_PATTERNS = {
    'email': re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
    'phone': re.compile(r'(?:\+91[\s-]?)?(?:\d{10}|\d{5}[\s-]\d{5}|\d{3}[\s-]\d{3}[\s-]\d{4})'),
    'pan': re.compile(r'[A-Z]{5}[0-9]{4}[A-Z]{1}'),
    'aadhaar': re.compile(r'\d{4}[\s-]?\d{4}[\s-]?\d{4}'),
    'ip_address': re.compile(r'\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b'),
    'credit_card': re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'),
}


def detect_with_regex(text):
    """Detect PII using regex patterns."""
    detections = []

    for pii_type, pattern in PII_PATTERNS.items():
        for match in pattern.finditer(text):
            value = match.group()

            # Validate aadhaar - must be exactly 12 digits
            if pii_type == 'aadhaar':
                cleaned = re.sub(r'[\s-]', '', value)
                if len(cleaned) != 12:
                    continue

            detections.append({
                'type': pii_type,
                'value': value,
                'start': match.start(),
                'end': match.end(),
                'confidence': 0.9,
                'method': 'regex'
            })

    return detections
