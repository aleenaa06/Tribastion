import sys
import requests
try:
    import cv2
    import pytesseract
    from pytesseract import Output
except ImportError:
    print("Required packages not installed. Run: pip install opencv-python pytesseract")
    sys.exit(1)

# Configure tesseract path for Windows if installed via installer.
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

PII_SERVICE_URL = "http://localhost:5001/detect"

def detect_pii(text):
    if not text.strip():
        return []
    try:
        response = requests.post(PII_SERVICE_URL, json={"text": text}, timeout=10)
        return response.json().get('entities', [])
    except Exception as e:
        print(f"Error detecting PII: {e}", file=sys.stderr)
        return []

def sanitize_image(input_path, output_path, method):
    try:
        image = cv2.imread(input_path)
        if image is None:
            raise ValueError(f"Could not open or find the image {input_path}")
            
        # Optional: Convert to grayscale for better OCR
        # gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Get OCR data including bounding boxes
        d = pytesseract.image_to_data(image, output_type=Output.DICT)
        
        text_lines = []
        current_line = []
        
        n_boxes = len(d['level'])
        for i in range(n_boxes):
            if int(d['conf'][i]) > 0:  # If it's a confident detection
                word = d['text'][i]
                (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])
                current_line.append({"text": word, "box": (x, y, w, h)})
        
        # Combine words into a single string to send to PII service
        full_text = " ".join([word["text"] for word in current_line])
        detections = detect_pii(full_text)
        
        for det in detections:
            pii_value = det['text']
            
            # Find the words that make up the PII value
            # This is a simple approximation. For multi-word PII, more complex matching is needed.
            for word_data in current_line:
                if word_data['text'] in pii_value:
                    (x, y, w, h) = word_data['box']
                    
                    # Blur the region
                    roi = image[y:y+h, x:x+w]
                    # Apply a strong Gaussian blur
                    blurred_roi = cv2.GaussianBlur(roi, (51, 51), 0)
                    image[y:y+h, x:x+w] = blurred_roi
                    
                    # Optional: draw black box instead
                    # cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 0), -1)

        cv2.imwrite(output_path, image)
        print("Success")
    except Exception as e:
        print(f"Failed to process Image: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python image_sanitizer.py <input_path> <output_path> <method>", file=sys.stderr)
        sys.exit(1)
        
    sanitize_image(sys.argv[1], sys.argv[2], sys.argv[3])
