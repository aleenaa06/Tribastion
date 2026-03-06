"""NER-based PII detector using spaCy."""

try:
    import spacy
    # Try loading English model
    try:
        nlp = spacy.load('en_core_web_sm')
    except OSError:
        print("WARNING: spaCy model 'en_core_web_sm' not found. Downloading...")
        from spacy.cli import download
        download('en_core_web_sm')
        nlp = spacy.load('en_core_web_sm')
    SPACY_AVAILABLE = True
except Exception as e:
    print(f"WARNING: spaCy initialization failed ({e}). NER detection disabled.")
    SPACY_AVAILABLE = False
    nlp = None

# Entity types that map to PII
ENTITY_MAPPING = {
    'PERSON': 'name',
    'GPE': 'address',
    'LOC': 'address',
    'FAC': 'address',
    'ORG': 'organization',
}

# Common false positives to skip
SKIP_VALUES = {
    'pii', 'api', 'json', 'csv', 'sql', 'pdf', 'txt', 'doc', 'docx',
    'http', 'https', 'www', 'com', 'org', 'net', 'admin', 'user',
    'input', 'output', 'file', 'data', 'name', 'email', 'phone',
    'address', 'redacted', 'masked', 'token', 'null', 'none',
}


def detect_with_ner(text):
    """Detect PII using spaCy Named Entity Recognition."""
    if not SPACY_AVAILABLE or nlp is None:
        return []

    detections = []

    # Process text (limit size for performance)
    max_length = 100000
    process_text = text[:max_length] if len(text) > max_length else text

    doc = nlp(process_text)

    for ent in doc.ents:
        if ent.label_ in ENTITY_MAPPING:
            value = ent.text.strip()

            # Skip very short or common false positive values
            if len(value) < 2 or value.lower() in SKIP_VALUES:
                continue

            # Skip single-word "names" under 3 characters
            if ent.label_ == 'PERSON' and len(value.split()) == 1 and len(value) < 3:
                continue

            pii_type = ENTITY_MAPPING[ent.label_]

            detections.append({
                'type': pii_type,
                'value': value,
                'start': ent.start_char,
                'end': ent.end_char,
                'confidence': 0.75,
                'method': 'ner'
            })

    return detections
