const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

async function parseFile(filePath, mimeType) {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
        case '.txt':
        case '.sql':
            return fs.readFileSync(filePath, 'utf-8');

        case '.csv':
            return await parseCsv(filePath);

        case '.json':
            return parseJson(filePath);

        case '.pdf':
            return await parsePdf(filePath);

        case '.docx':
            return await parseDocx(filePath);

        case '.jpg':
        case '.jpeg':
        case '.png':
            return `[Image file: ${path.basename(filePath)}. OCR text extraction would be performed by the PII detection service.]`;

        default:
            // Try reading as text
            try {
                return fs.readFileSync(filePath, 'utf-8');
            } catch {
                return `[Unsupported file format: ${ext}]`;
            }
    }
}

async function parseCsv(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => rows.push(row))
            .on('end', () => {
                const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
                let text = headers.join(', ') + '\n';
                rows.forEach(row => {
                    text += Object.values(row).join(', ') + '\n';
                });
                resolve(text);
            })
            .on('error', reject);
    });
}

function parseJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
        const data = JSON.parse(content);
        return JSON.stringify(data, null, 2);
    } catch {
        return content;
    }
}

async function parsePdf(filePath) {
    try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (err) {
        console.error('PDF parse error:', err.message);
        return `[Error parsing PDF: ${err.message}]`;
    }
}

async function parseDocx(filePath) {
    try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (err) {
        console.error('DOCX parse error:', err.message);
        return `[Error parsing DOCX: ${err.message}]`;
    }
}

module.exports = { parseFile };
