const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testSanitize() {
    console.log("Creating test CSV...");
    const testCsvPath = path.join(__dirname, 'test.csv');
    // Write test CSV with a phone number
    fs.writeFileSync(testCsvPath, "id,name,phone\n1,Jane Doe,9876543210\n");

    const form = new FormData();
    form.append('file', fs.createReadStream(testCsvPath));

    try {
        console.log("Sending to POST /api/files/sanitize...");
        const response = await axios.post('http://localhost:5000/api/files/sanitize', form, {
            headers: {
                ...form.getHeaders()
            },
            responseType: 'stream'
        });

        const outputPath = path.join(__dirname, 'sanitized_test.csv');
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log("Test passed: Received sanitized_test.csv");
            console.log("Content:", fs.readFileSync(outputPath, 'utf8'));

            // Clean up
            fs.unlinkSync(testCsvPath);
            fs.unlinkSync(outputPath);
            console.log("Cleanup done.");
        });

    } catch (err) {
        console.error("Test failed:", err.message);
        if (fs.existsSync(testCsvPath)) fs.unlinkSync(testCsvPath);
    }
}

testSanitize();
