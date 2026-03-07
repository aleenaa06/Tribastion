const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const pythonScriptDir = path.join(__dirname, '..', '..', '..', 'pii-service', 'sanitizers');

const spawnSanitizer = (scriptName, inputFile, outputFile, method) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(pythonScriptDir, scriptName);

        // Use python from environment
        const pythonProcess = spawn('python', [scriptPath, inputFile, outputFile, method]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => { stdoutData += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { stderrData += data.toString(); });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(stdoutData);
            } else {
                reject(new Error(`Python script ${scriptName} failed with code ${code}: ${stderrData}`));
            }
        });
    });
};

const processAndSanitize = async (inputFile, outputFile, mimeType, method) => {
    // Determine file type from extension
    const ext = path.extname(inputFile).toLowerCase();

    switch (ext) {
        case '.csv':
            await spawnSanitizer('csv_sanitizer.py', inputFile, outputFile, method);
            break;
        case '.json':
            await spawnSanitizer('json_sanitizer.py', inputFile, outputFile, method);
            break;
        case '.pdf':
            await spawnSanitizer('pdf_sanitizer.py', inputFile, outputFile, method);
            break;
        case '.docx':
            await spawnSanitizer('docx_sanitizer.py', inputFile, outputFile, method);
            break;
        case '.jpg':
        case '.jpeg':
        case '.png':
            // Optional image processing if opencv/tesseract is available
            await spawnSanitizer('image_sanitizer.py', inputFile, outputFile, method);
            break;
        case '.txt':
        case '.sql':
            await spawnSanitizer('txt_sanitizer.py', inputFile, outputFile, method);
            break;
        default:
            throw new Error(`Unsupported file type for format-preserving sanitization: ${ext}`);
    }

    return outputFile;
};

module.exports = {
    processAndSanitize
};
