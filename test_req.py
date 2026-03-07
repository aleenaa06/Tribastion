import requests

login_url = "http://localhost:5000/api/auth/login"
upload_url = "http://localhost:5000/api/files/upload"

try:
    print("Logging in...")
    auth_res = requests.post(login_url, json={"username": "admin", "password": "admin123"})
    token = auth_res.json().get('token')
    
    if token:
        print("Logged in. Uploading file...")
        headers = {'Authorization': f'Bearer {token}'}
        files = {'file': ('dummy.txt', b'this is a test text file', 'text/plain')}
        data = {'method': 'tokenization'}
        
        up_res = requests.post(upload_url, headers=headers, files=files, data=data)
        print("Status Code:", up_res.status_code)
        print("Response:", up_res.text)
    else:
        print("Login failed:", auth_res.text)

except Exception as e:
    print("Exception:", e)
