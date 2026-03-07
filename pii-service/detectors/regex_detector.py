import re

# Regex patterns for PII detection
PII_PATTERNS = {
    'EMAIL': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'),
    'PHONE_NUMBER': re.compile(r'\b[6-9]\d{9}\b'),
    'PAN_NUMBER': re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'),
    'AADHAAR_NUMBER': re.compile(r'\b\d{4}\s?\d{4}\s?\d{4}\b'),
    'TRANSACTION_ID': re.compile(r'\b\d{10,18}\b'),
    'CREDIT_CARD': re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'),
    'DATE_OF_BIRTH': re.compile(r'\b\d{2}[-/]\d{2}[-/]\d{4}\b'),
    'BANK_ACCOUNT': re.compile(r'\b\d{9,18}\b')
}

def detect_with_regex(text):
    """Detect PII using regex patterns."""
    detections = []

    for pii_type, pattern in PII_PATTERNS.items():
        for match in pattern.finditer(text):
            value = match.group()

            # Validate aadhaar - must be exactly 12 digits
            if pii_type == 'AADHAAR_NUMBER':
                cleaned = re.sub(r'[\s-]', '', value)
                if len(cleaned) != 12:
                    continue

            detections.append({
                'label': pii_type,
                'text': value,
                'start': match.start(),
                'end': match.end(),
                'confidence': 0.9,
                'method': 'regex'
            })

    return detections
