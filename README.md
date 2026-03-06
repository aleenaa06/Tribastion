# Secure PII Detection and Data Sanitization Platform (Tribastion)

Tribastion is a production-ready, full-stack web platform built for automatic detection, extraction, and sanitization of Personally Identifiable Information (PII) from multiple data formats.

Built for the **Cybersecurity Hackathon 2024**, this platform aims to solve the manual overhead associated with protecting sensitive data such as names, Aadhar numbers, PAN numbers, email addresses, and phone numbers.

![Tribastion Platform](./screenshot.png) *(Preview placeholder)*

## Features

- **Multi-format Support:** Upload and process CSV, JSON, TXT, SQL, PDF, DOCX, JPG, and PNG files.
- **Advanced PII Detection:** Hybrid detection engine combining Regex patterns and spaCy Named Entity Recognition (NER) for high accuracy. 
- **Flexible Sanitization:** Choose between Masking, Redaction (Replacement), and Tokenization.
- **Role-Based Access Control (RBAC):** Admins can upload, manage users, and view raw files. Standard users can only view and download sanitized data.
- **Audit Logging:** Comprehensive tracking of all actions (uploads, downloads, detections) for compliance.
- **Analytics Dashboard:** Visual representation of files processed, PII detected, and upload trends using Chart.js.
- **Cybersecurity UI Themes:** Modern Dark/Light glassmorphism UI designed for a professional security operations center feel.

## Tech Stack

### Frontend
- React 18
- React Router DOM
- TailwindCSS (via CDN for zero-config rapid styling)
- Chart.js & React-Chartjs-2
- Axios & React-Dropzone

### Backend 
- Node.js & Express
- `sql.js` (Zero-config pure JavaScript SQLite database - chosen over `better-sqlite3` to avoid native compilation issues on Windows during the hackathon)
- JSON Web Tokens (JWT) for Authentication
- Multer for file uploads 

### PII Microservice
- Python & Flask
- spaCy Library for NLP/NER (en_core_web_sm)
- Regex Engine

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- pip

### 1. Setup the Python PII Microservice

Open a terminal and navigate to the `pii-service` directory:
```bash
cd pii-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py
```
*The service will run on port 5001.*

### 2. Setup the Node.js Backend

Open a new terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
npm run start
```
*The service will start on port 5000 and automatically create the SQLite database file.*

### 3. Setup the React Frontend

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm start
```
*The app will be available at `http://localhost:3000`.*

## Default Credentials

The platform initializes with a default admin user:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `Admin`

*You can create standard users or additional admins from the 'Manage Users' dashboard.*

## Sample Data included

Inside the `sample-data/` folder, you will find ready-to-use dummy files to test the system:
- `sample_data.csv`
- `sample_data.json`
- `sample_data.sql`
- `sample_letter.txt`

These files contain mock Indian PII (Aadhaar, PAN, Names, Phone numbers) ideal for testing the detection engine.

## Environment Variables

All services use reasonable defaults for the hackathon context. You can modify backend configuration using `.env` in the `backend/` folder.
```env
PORT=5000
JWT_SECRET=super-secret-hackathon-key-change-me
PII_SERVICE_URL=http://localhost:5001/detect
```

## Security Considerations
* Note: For this hackathon demo, the `sql.js` database is being written directly to the filesystem every few seconds for persistence. In a true production set up, this would be replaced by PostgreSQL. 
* JWT tokens are currently stored in `localStorage` for simplicity, but could be moved to HTTP-only cookies.

---
**Developed for the Secure Data Sanitization Challenge**