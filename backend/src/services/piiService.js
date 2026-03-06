const axios = require('axios');

const PII_SERVICE_URL = process.env.PII_SERVICE_URL || 'http://localhost:5001';

// Fallback regex patterns when Python service is unavailable
const PII_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(?:\+91[-\s]?)?(?:\d{10}|\d{5}[-\s]\d{5}|\d{3}[-\s]\d{3}[-\s]\d{4})/g,
    pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
    aadhaar: /\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
    ip_address: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
};

async function detectPii(text) {
    try {
        // Try Python PII service first
        const response = await axios.post(`${PII_SERVICE_URL}/detect`, { text }, { timeout: 30000 });
        return response.data.detections || [];
    } catch (err) {
        console.warn('Python PII service unavailable, using fallback regex detection:', err.message);
        return fallbackDetection(text);
    }
}

function fallbackDetection(text) {
    const detections = [];

    for (const [piiType, pattern] of Object.entries(PII_PATTERNS)) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text)) !== null) {
            // Skip aadhaar-like patterns that are actually other numbers
            if (piiType === 'aadhaar') {
                const cleaned = match[0].replace(/[-\s]/g, '');
                if (cleaned.length !== 12) continue;
            }

            detections.push({
                type: piiType,
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
                confidence: 0.85,
                method: 'regex'
            });
        }
    }

    // Simple name detection (capitalized words of 2+ that aren't common words)
    const commonWords = new Set(['The', 'This', 'That', 'These', 'Those', 'With', 'From', 'Your', 'Have', 'Been', 'Will', 'Would', 'Could', 'Should', 'About', 'After', 'Before', 'Between', 'Under', 'Over', 'Into', 'Through', 'During', 'Each', 'Every', 'Some', 'Many', 'More', 'Most', 'Other', 'Such', 'Only', 'Very', 'Also', 'Just', 'Because', 'Here', 'There', 'Where', 'When', 'Then', 'Than', 'Both', 'However', 'Dear', 'Sir', 'Madam', 'Date', 'Subject', 'Name', 'Address', 'Phone', 'Email', 'Input', 'Output', 'Error', 'File', 'Data']);
    const namePattern = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b/g;
    let nameMatch;
    while ((nameMatch = namePattern.exec(text)) !== null) {
        const words = nameMatch[1].split(/\s+/);
        if (words.length >= 2 && words.length <= 4 && !words.some(w => commonWords.has(w))) {
            detections.push({
                type: 'name',
                value: nameMatch[1],
                start: nameMatch.index,
                end: nameMatch.index + nameMatch[1].length,
                confidence: 0.7,
                method: 'regex'
            });
        }
    }

    return detections;
}

module.exports = { detectPii };
