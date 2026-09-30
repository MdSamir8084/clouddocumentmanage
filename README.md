# Cloud Student Management & Document Portal

A full-stack student/admin portal designed for later deployment on AWS.

## Current local stack
- HTML/CSS/JavaScript
- Node.js + Express
- MySQL
- Session authentication
- Local document storage

## Planned AWS deployment
- EC2: application
- RDS: MySQL database
- S3: document storage
- VPC + Security Groups
- ALB + Auto Scaling
- Route 53
- CloudFront
- CloudWatch
- GitHub Actions CI/CD

## Local setup

1. Install Node.js and MySQL.
2. Create a MySQL database.
3. Run `database/schema.sql`.
4. Copy `.env.example` to `.env` and edit credentials.
5. Run:
   ```bash
   npm install
   npm start
   ```
6. Open `http://localhost:3000`.

Admin credentials come from `.env`.
