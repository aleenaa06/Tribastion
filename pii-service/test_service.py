import requests
import json

response = requests.post("http://localhost:5001/detect", json={"text": "My phone number is 9876543210 and my name is John Doe."})
print(json.dumps(response.json(), indent=2))
