# Backend Architecture: Models and Routes

This document outlines the backend structure for the Web Donation platform, including data models, API routes, and Cloudinary integration for image management.

## 1. Data Models (Mongoose)

### User Model
- `name`: String (Required)
- `email`: String (Required, Unique)
- `secondaryEmails`: [String] (Secondary email addresses)
- `password`: String (Required, Hashed)
- `role`: String (Enum: ['Donor', 'NGO', 'Admin'], Default: 'Donor')
- `phone`: String
- `country`: String
- `city`: String
- `createdAt`: Date (Default: now)

### Donor Profile
- `user`: ObjectId (Ref: User, Required)
- `profilePicture`: String (Cloudinary URL)
- `bio`: String
- `totalDonated`: Number (Default: 0)
- `campaignsSupportedCount`: Number (Default: 0)
- `preferences`:
    - `emailReceipts`: Boolean (Default: true)
    - `ngoUpdates`: Boolean (Default: true)
- `paymentMethods`: [{
    - `type`: String (Enum: ['Telebirr', 'CBE', 'Card'])
    - `identifier`: String (e.g., Masked phone or card number)
    - `isDefault`: Boolean
}]

### NGO Profile
- `user`: ObjectId (Ref: User, Required)
- `ngoName`: String (Required)
- `description`: String (Required)
- `logo`: String (Cloudinary URL)
- `banner`: String (Cloudinary URL)
- `isVerified`: Boolean (Default: false)
- `registrationLinks`: [String] (Path to documents/Cloudinary)
- `categories`: [String] (e.g., 'Education', 'Health', 'Environment')

### Campaign Model
- `title`: String (Required)
- `description`: String (Required)
- `posterImage`: String (Cloudinary URL)
- `targetAmount`: Number (Required)
- `currentAmount`: Number (Default: 0)
- `ngo`: ObjectId (Ref: NGO, Required)
- `category`: String
- `deadline`: Date
- `status`: String (Enum: ['Active', 'Completed', 'Paused'], Default: 'Active')
- `createdAt`: Date (Default: now)

### Donation Model
- `campaign`: ObjectId (Ref: Campaign, Required)
- `donor`: ObjectId (Ref: Donor, Optional for anonymous/manual)
- `donorName`: String (Defaults to "Anonymous" if specified)
- `amount`: Number (Required)
- `isAnonymous`: Boolean (Default: false)
- `isManual`: Boolean (Default: false - set to true for manual entries by NGO)
- `message`: String
- `date`: Date (Default: now)

---

## 2. API Routes

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/register` | Register new user (Donor or NGO) |
| POST | `/login` | Authenticate user and return JWT |
| GET | `/me` | Get current logged-in user info |

### NGOs (`/api/ngos`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List all verified NGOs |
| GET | `/:id` | Get detailed NGO profile and their campaigns |
| PUT | `/profile` | Update NGO profile (description, logo, banner) |

### Campaigns (`/api/campaigns`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all campaigns (Filters: `name`, `minAmount`, `maxAmount`, `date`, `ngo`) |
| GET | `/:id` | Get campaign details + top/recent donations |
| POST | `/` | Create new campaign (NGO Only - includes image upload) |
| PUT | `/:id` | Update campaign info |

### Donations (`/api/donations`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/` | Submit a new donation (Public/Donor) |
| POST | `/manual` | Manually add a donation (NGO Only) |
| GET | `/campaign/:campaignId` | Get all donations for a campaign (Paginated) |
| GET | `/my-donations` | Get donation history for the logged-in donor |

---

## 3. Cloudinary Integration

### Implementation Plan
- Use `multer` and `multer-storage-cloudinary` for handling multipart/form-data.
- **NGO Logos/Banners**: NGOs can upload their brand assets during registration or profile update.
- **Campaign Posters**: Every campaign creation requires a poster image stored on Cloudinary.
- **Donor Avatars**: Donors can upload/update profile pictures.

### Storage Strategy
- Folders organized by entity: `web_donation/ngos`, `web_donation/campaigns`, `web_donation/donors`.
- Transformations: Auto-crop and resize for thumbnails to optimize performance.

---

## 4. Overall Analysis
- **Scalability**: Using MongoDB and Cloudinary allows the app to handle growth in data and media effortlessly.
- **Security**: All writing operations (creating campaigns, manual donations) will be protected by JWT and Role-Based Access Control (RBAC).
- **Flexibility**: The donation model supports both logged-in users and anonymous/manual entries, catering to all use cases requested.


---

# TASKS Remaining 

1. Finsh converting existing code to Node only
2. Create MongoDB Atlas for this
3. Configure Cloudinary
4. Finish the routes and controllers needed for the 9 pages 
5. Conenect those to the frontend with states
6. Clean up the frontend