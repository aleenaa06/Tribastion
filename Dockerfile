FROM python:3.10-slim

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    tesseract-ocr \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package.json and install concurrently
COPY package.json package-lock.json* ./
RUN npm install

# Install Python dependencies
COPY pii-service/requirements.txt ./pii-service/
RUN pip install --no-cache-dir -r pii-service/requirements.txt
RUN python -m spacy download en_core_web_sm

# Install Node backend dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install

# Copy source code
COPY pii-service/ ./pii-service/
COPY backend/ ./backend/

# Ensure necessary directories exist
RUN mkdir -p backend/uploads backend/sanitized backend/data

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000

# Expose the API port
EXPOSE 5000

# Start both Node.js and Python services via concurrently
CMD ["npm", "start"]
