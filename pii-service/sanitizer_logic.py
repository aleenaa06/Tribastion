import re

# In-memory dictionary to track token counts during a single file processing run.
# Safe because each format sanitizer is spawned as a fresh process.
token_counters = {}

def apply_masking(text, label):
    if label == 'PHONE_NUMBER':
        digits = re.sub(r'\D', '', text)
        if len(digits) >= 4:
            return 'X' * (len(digits) - 4) + digits[-4:]
        return 'X' * len(text)
    
    elif label == 'AADHAAR_NUMBER':
        digits = re.sub(r'\D', '', text)
        if len(digits) == 12:
            return f"XXXX XXXX {digits[-4:]}"
        return 'X' * len(text)
    
    elif label == 'PAN_NUMBER':
        if len(text) == 10:
            return text[:3] + '****' + text[-3:]
        return '*' * len(text)
    
    elif label == 'NAME':
        words = text.split()
        masked_words = [w[0] + '*' * 4 if len(w) > 0 else '' for w in words]
        # Example output expects "S**** H**** H****"
        return ' '.join(masked_words)
        
    elif label == 'CREDIT_CARD':
        digits = re.sub(r'\D', '', text)
        if len(digits) >= 4:
            return f"XXXX XXXX XXXX {digits[-4:]}"
        return '*' * len(text)
        
    elif label == 'EMAIL':
        parts = text.split('@')
        if len(parts) == 2:
            name, domain = parts
            return name[0] + '*' * (len(name) - 1) + '@' + domain
        return '*' * len(text)
        
    else:
        # Generic masking for ADDRESS, TRANSACTION_ID, DOB, etc.
        if len(text) <= 4:
            return '*' * len(text)
        return text[:2] + '*' * (len(text) - 4) + text[-2:]

def apply_sanitization(text, label, method):
    """
    Applies the chosen sanitization method to the PII string.
    method can be 'redaction', 'masking', or 'tokenization'
    """
    method = method.lower()
    
    if method == 'redaction':
        return '[REDACTED]'
        
    elif method == 'masking':
        return apply_masking(text, label)
        
    elif method == 'tokenization':
        global token_counters
        
        # Clean up the label for the token (e.g., AADHAAR_NUMBER -> AADHAAR)
        clean_label = label.replace('_NUMBER', '')
        
        if clean_label not in token_counters:
            token_counters[clean_label] = 1
        else:
            token_counters[clean_label] += 1
            
        return f"<{clean_label}_TOKEN_{token_counters[clean_label]}>"
        
    else:
        # Fallback to redaction if method is unknown
        return '[REDACTED]'
