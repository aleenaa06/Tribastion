-- Sample SQL file with PII data
-- Customer database records

CREATE TABLE customers (
    id INT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    pan_number VARCHAR(10),
    aadhaar_number VARCHAR(14),
    address TEXT
);

INSERT INTO customers VALUES (1, 'Rahul Sharma', 'rahul.sharma@email.com', '+91-98765-43210', 'ABCPD1234E', '1234-5678-9012', '42 MG Road, Bangalore');
INSERT INTO customers VALUES (2, 'Priya Patel', 'priya.patel@gmail.com', '9876543210', 'BXYPK5678F', '9876-5432-1098', '15 Linking Road, Mumbai');
INSERT INTO customers VALUES (3, 'Aman Gupta', 'aman.gupta@company.co.in', '+91 87654 32109', 'CZQPG9012H', '5678-1234-9876', '78 Connaught Place, New Delhi');
INSERT INTO customers VALUES (4, 'Sneha Reddy', 'sneha.reddy@yahoo.com', '7654321098', 'DELPQ3456J', '3456-7890-1234', '23 Jubilee Hills, Hyderabad');
INSERT INTO customers VALUES (5, 'Vikram Singh', 'vikram.singh@outlook.com', '+91-76543-21098', 'EFGHI7890K', '7890-1234-5678', '56 Civil Lines, Jaipur');
