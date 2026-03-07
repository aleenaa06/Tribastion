const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    try {
        console.log('Logging in as admin...');
        const authRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin-password'
        });
        const token = authRes.data.token;
        console.log('Got token:', token);

        const filePath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(filePath, 'Hello my name is SHAH HARSHUL HIREN');
        const fileStream = fs.createReadStream(filePath);

        const formData = new FormData();
        formData.append('method', 'tokenization');
        formData.append('sanitization_method', 'tokenization');
        formData.append('file', fileStream);

        console.log('Sending request to /api/files/upload...');
        const response = await axios.post('http://localhost:5000/api/files/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Success! Output:');
        console.log(response.data);
    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
}

testUpload();
