# Miniproject
BuildEasy is a smart construction-material marketplace that connects customers with verified suppliers. It provides material search, company-based sourcing, order management, delivery tracking, COD payment updates, and AI-powered construction-stage analysis and material estimation for a streamlined construction experience.
....................................................................................................................................................................
BuildEasy 🏗️

BuildEasy is a smart construction-material management and marketplace platform designed to simplify the process of finding, purchasing, and delivering construction materials. It connects customers with verified suppliers while providing intelligent material estimation, construction-stage analysis, order management, and delivery tracking.

🚀 Features
👤 Customer
User registration and secure login
Search construction materials
Search companies by name, location, city, or pincode
View material price, stock, company, and source location
Add materials to cart
Place construction-material orders
Cash on Delivery (COD)
Track order and delivery status
View assigned driver and company details
AI-based construction-stage analysis
AI-based material estimation
🏢 Company / Supplier
Company registration
Admin approval system
Add and manage construction materials
Manage material stock and prices
View and approve customer orders
Assign available drivers
Add and manage company drivers
Track deliveries
Update order and delivery status
🚚 Driver
Driver registration through company
Admin approval before account creation
Secure driver login
View assigned deliveries
Update delivery status
Confirm COD payment collection
Mark orders as delivered
👨‍💼 Admin
Admin authentication
Manage customers, companies, materials, and orders
Approve/reject companies
Approve/reject drivers
Monitor deliveries
Manage platform data
View system activity and statistics
🤖 AI Construction Analyzer
Upload construction-site images
Analyze the current construction stage
Predict construction stage with confidence
Recommend materials required for the next stage
Estimate required construction materials
Gemini Vision API integration
🛠️ Technology Stack

Frontend

HTML5
CSS3
JavaScript

Backend

Node.js
Express.js
REST API

Database

MongoDB

AI

Google Gemini API
Computer Vision
Construction-stage classification

Other Technologies

Geolocation API
Google Maps API
Git & GitHub
📂 Project Structure
BuildEasy/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── materials.html
│   ├── orders.html
│   ├── estimate.html
│   ├── admin.html
│   ├── company.html
│   ├── driver.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── middleware/
│
├── ai/
│   ├── models/
│   ├── dataset/
│   └── analyzer/
│
├── README.md
├── package.json
└── .env.example
🔄 System Workflow
Customer
   │
   ▼
Search Materials
   │
   ▼
Select Company & Material
   │
   ▼
Place Order
   │
   ▼
Company Approval
   │
   ▼
Driver Assignment
   │
   ▼
Delivery
   │
   ▼
COD Payment
   │
   ▼
Order Completed
🤖 AI Workflow
Construction Image
        ↓
   Image Upload
        ↓
    AI Analysis
        ↓
Construction Stage
        ↓
Confidence Score
        ↓
Next Construction Stage
        ↓
Required Materials
🔐 Security
Role-based access control
Admin approval for companies and drivers
Password-protected accounts
Backend API validation
Environment variables for API keys
Gemini API key is not exposed in frontend code
