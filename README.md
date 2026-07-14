# Web Donation Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717.svg?style=for-the-badge&logo=github)](https://github.com/ob22a/Web-donation)
[![Postman Collection](https://img.shields.io/badge/Postman-API_Tests-FF6C37.svg?style=for-the-badge&logo=postman)](https://www.postman.com/ob22adegefu123-5110310/workspace/web-donation)

A comprehensive full-stack web application designed to bridge the gap between donors and Non-Governmental Organizations (NGOs). This platform facilitates transparent, secure, and efficient online donations for various campaigns and causes.

## 🚀 Key Features & Core Tasks

The platform is purpose-built to handle the end-to-end flow of charitable giving, ensuring a seamless experience for all parties involved.

* **Campaign Management:** NGOs can create, update, and manage fundraising campaigns with detailed descriptions, target goals, and engaging cover images.
* **Secure Donations:** Users can make one-time contributions or set up recurring donations to support their chosen campaigns.
* **Email Notifications:** Automated email receipts and notifications for successful donations, user registrations, and important campaign updates.
* **Media Management:** Robust handling of image uploads for user profiles, NGO logos, and campaign banners.

## 👥 Role-Based Architecture

The application logic and user interfaces are strictly divided based on user roles, ensuring secure and relevant access to features.

### 1. Donor Role
* **Frontend:** Access to a personalized dashboard to track donation history, manage recurring donations, and discover active NGO campaigns.
* **Backend:** Endpoints restricted to viewing public campaigns, initiating donations, and updating personal profile information securely.

### 2. NGO (Non-Governmental Organization) Role
* **Frontend:** A dedicated management portal to create new fundraising campaigns, track campaign progress in real-time, view donor lists, and manage organizational details.
* **Backend:** Secure routes for Campaign CRUD operations, accessing aggregated donation statistics, and uploading organizational media.

### 3. Administrator Role
* **Frontend:** Overview dashboard for platform moderation, verifying NGOs, and monitoring overall site activity and donation flows.
* **Backend:** Highest level of route clearance for user management, system auditing, and platform-wide configurations.

## 🛠️ Tech Stack & Integrated Services

### Frontend
The frontend is built for speed, responsiveness, and a dynamic user experience.
* **React:** Modern UI component library for building interactive user interfaces.
* **Vite:** Next-generation frontend tooling for lightning-fast development server and optimized production builds.
* **React Router DOM:** For seamless single-page application (SPA) navigation and routing.

### Backend
The backend provides a robust, secure, and scalable RESTful API.
* **Node.js:** JavaScript runtime environment for the server.
* **MongoDB & Mongoose:** NoSQL database for flexible data modeling (Users, NGOs, Campaigns, Donations, etc.).
* **JWT (JSON Web Tokens):** Secure, stateless user authentication and role-based authorization.
* **Bcrypt.js:** Cryptographic secure password hashing.

### Third-Party Services & Utility Tools
* **Cloudinary:** Cloud-based object storage utilized for seamlessly hosting, managing, and delivering user-uploaded media (e.g., campaign images, profile pictures). File parsing is handled via `formidable`.
* **Nodemailer:** Email sending service integrated to reliably dispatch transactional emails such as donation receipts, password resets, and welcome messages.

## ⚙️ Getting Started

### Prerequisites
* Node.js installed on your machine
* MongoDB instance running (local or Atlas)
* Cloudinary Account (API Key, API Secret, Cloud Name)
* SMTP Server details (for Nodemailer)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ob22a/Web-donation.git
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### Environment Variables

To run this project locally, create a `.env` file in the `backend` directory and add the following environment variables:

```env
PORT=3000
AllowedOrigins=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=your_jwt_secret_key
MONGO_URI=your_mongodb_connection_string

# Cloudinary (Object Storage for Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer (Email Service)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_app_password
```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
