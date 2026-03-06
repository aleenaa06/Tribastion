const { v4: uuidv4 } = require('uuid');

function sanitizeText(text, detections, method = 'redaction') {
    if (!detections || detections.length === 0) return { sanitizedText: text, appliedMasks: [] };

    // Sort detections by start position (descending) to replace from end to start
    const sorted = [...detections].sort((a, b) => b.start - a.start);
    let sanitized = text;
    const appliedMasks = [];

    for (const detection of sorted) {
        let replacement;
        const original = detection.value;

        switch (method) {
            case 'masking':
                replacement = maskValue(original, detection.type);
                break;
            case 'tokenization':
                replacement = `[TOKEN_${uuidv4().substring(0, 8).toUpperCase()}]`;
                break;
            case 'redaction':
            default:
                replacement = `[REDACTED_${detection.type.toUpperCase()}]`;
                break;
        }

        // Replace the detection in the text
        sanitized = sanitized.substring(0, detection.start) + replacement + sanitized.substring(detection.end);

        appliedMasks.push({
            id: uuidv4(),
            type: detection.type,
            original: original,
            masked: replacement,
            start: detection.start,
            end: detection.end,
            confidence: detection.confidence,
            method: detection.method || 'regex'
        });
    }

    return { sanitizedText: sanitized, appliedMasks };
}

function maskValue(value, type) {
    switch (type) {
        case 'email': {
            const [local, domain] = value.split('@');
            if (local.length <= 1) return `*@${domain}`;
            return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 5))}@${domain}`;
        }
        case 'phone': {
            const digits = value.replace(/\D/g, '');
            if (digits.length <= 4) return '****';
            return digits.substring(0, 2) + '*'.repeat(digits.length - 4) + digits.substring(digits.length - 2);
        }
        case 'pan':
            return value.substring(0, 2) + '***' + value.substring(5, 8) + '**';
        case 'aadhaar': {
            const clean = value.replace(/[-\s]/g, '');
            return 'XXXX-XXXX-' + clean.substring(8);
        }
        case 'ip_address': {
            const parts = value.split('.');
            return `${parts[0]}.***.***.${parts[3]}`;
        }
        case 'name':
            return value.split(' ').map(w => w[0] + '*'.repeat(w.length - 1)).join(' ');
        case 'credit_card': {
            const ccDigits = value.replace(/\D/g, '');
            return '*'.repeat(ccDigits.length - 4) + ccDigits.substring(ccDigits.length - 4);
        }
        case 'address':
            return '[MASKED_ADDRESS]';
        default:
            if (value.length <= 2) return '**';
            return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
    }
}

module.exports = { sanitizeText };
