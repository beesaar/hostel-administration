# 🏰 Unistay — Master Project Document
### MCA Mini Project Documentation & Technical Reference Manual

---

## 📌 1. Project Synopsis & Overview

**Unistay** is a full-stack web application developed using the **MERN (MongoDB Atlas, Express.js, React, Node.js)** stack. It addresses the real-world operational challenges of hostel property onboarding, room allocation, bed management, student admissions, complaints resolution, and administrative moderation.

### Core System Objectives:
1. **Centralized Platform Administration**: Master Admin control center for monitoring platform-wide metrics, viewing verified managers/students, and moderating hostel property listings.
2. **Hostel Property & Room Management**: Enables hostel managers to register properties, configure room types (Single, Double, Triple), set bed capacities, and track monthly rental tariffs.
3. **Student Accommodation Booking**: Allows students to explore approved hostels, inspect room availability, filter by amenities, and submit booking applications.
4. **Geospatial Discovery**: Interactive OpenStreetMap & React Leaflet mapping for visual location tracking and proximity searching.
5. **Operational Workflows**: Issue tracking, student complaint lodging, and image uploads (via Multer).

---

## 📊 2. Overall Progress Dashboard

```text
Project Completion: [██████████████████████████████████████░░░░░░░░░] 77%
```

| Phase | Milestone / Module | Status | Deliverables |
| :---: | :--- | :---: | :--- |
| **1** | Project Setup & MVC Architecture | ✅ **Completed** | Full folder hierarchy, Tailwind v4, Express server, health-check. |
| **2** | MongoDB Atlas Database Layer | ✅ **Completed** | Mongoose connection, `.env` config, DNS SRV fallback resolver. |
| **3** | Authentication & RBAC Engine | ✅ **Completed** | `User` model, `bcrypt` hashing, JWT access tokens, `protect` & `authorize` middleware. |
| **4** | Admin Backend Module | ✅ **Completed** | `Hostel` model (geospatial index), `adminController`, moderation APIs, aggregation stats. |
| **5** | Admin Frontend Portal | ✅ **Completed** | Admin Login, Dashboard, Managers List, Students List, Hostels Directory, Pending Approvals, Protected Routes. |
| **6** | Hostel Manager Module | ✅ **Completed** | Manager Dashboard, Hostel CRUD. |
| **7** | Room Management Module | ✅ **Completed** | Room Schema, Bed Allocation, Pricing, Availability Logic. |
| **8** | Student Booking & Allocation System | ⏳ *In Progress* | Student Portal, Hostel Browsing, Room Booking Requests, Status Tracking. |
| **9** | Complaints, Map, Notices & Image Uploads | ⏳ *Upcoming* | React Leaflet, Multer file upload, Complaint lodging, Manager resolution. |

---

## 🏛️ 3. System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │             Client Layer (Frontend - Vite)             │
   │  React 19 + Tailwind CSS + Lucide Icons + React Router │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / REST APIs (Axios)
                               │ Authorization: Bearer <JWT>
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │         Application Layer (Backend - Node & Express)   │
   │   MVC Architecture: Routes -> Middleware -> Controller │
   └───────────────────────────┬────────────────────────────┘
                               │ Mongoose ODM (BSON)
                               │ DNS Resolver: 8.8.8.8
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │          Database Layer (Cloud - MongoDB Atlas)        │
   │   Collections: Users, Hostels, Rooms*, Bookings*       │
   └────────────────────────────────────────────────────────┘
```

### Technology Breakdown:
* **Frontend**: React 19, Vite, Tailwind CSS v4, React Router DOM v7, Axios, Lucide React Icons, React Leaflet, Leaflet.
* **Backend**: Node.js, Express.js (MVC Pattern), CORS, Dotenv.
* **Database**: MongoDB Atlas Cloud Cluster, Mongoose ODM.
* **Security & Auth**: JSON Web Tokens (JWT), `bcrypt` (10 salt rounds), Custom Role-Based Access Control (RBAC) middleware.
* **Media Handling**: Multer for multipart form data (Upcoming).

---

## 🗄️ 4. Data Models & Database Schema Specifications

### 4.1 User Schema (`backend/models/User.js`)

Represents all user entities on the platform.

```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { 
    type: String, 
    enum: ['Admin', 'Hostel Manager', 'Student'], 
    default: 'Student' 
  },
  createdAt: { type: Date, default: Date.now }
}
```

* **Security Hooks**:
  * `pre('save')`: Automatically salts and hashes passwords using `bcrypt.hash(password, 10)`.
  * `select: false`: Prevents inadvertent password leakage in queries.
  * `matchPassword(enteredPassword)`: Compares plain-text candidate passwords against stored bcrypt hash.

---

### 4.2 Hostel Schema (`backend/models/Hostel.js`)

Represents accommodation properties submitted by managers for platform moderation.

```javascript
{
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Boys', 'Girls', 'Co-ed'], required: true },
  description: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [77.5946, 12.9716] } // [Longitude, Latitude]
  },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalRooms: { type: Number, default: 0 },
  totalBeds: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  rejectionReason: { type: String, default: '' },
  amenities: { type: [String], default: ['WiFi', 'CCTV', 'Security'] },
  images: { type: [String], default: [] }
}
```

* **Geospatial Indexing**: `hostelSchema.index({ location: '2dsphere' })` allows distance radius queries for OpenStreetMap.

---

## 📡 5. Complete REST API Catalog

### 5.1 Authentication APIs (`/api/auth`)

| Endpoint | Method | Access | Description | Request Body |
| :--- | :---: | :---: | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account | `{ name, email, phone, password, role }` |
| `/api/auth/login` | `POST` | Public | Verify credentials & issue JWT | `{ email, password }` |
| `/api/auth/me` | `GET` | Private | Get profile of logged-in user | *None (Bearer Token in Header)* |

---

### 5.2 Admin APIs (`/api/admin`)

*All routes require `protect` (valid JWT) and `authorize('Admin')`.*

| Endpoint | Method | Access | Description | Response Details |
| :--- | :---: | :---: | :--- | :--- |
| `/api/admin/dashboard` | `GET` | Admin | Real-time counts and recent previews | `{ stats: { totalStudents, totalManagers, totalHostels, pendingHostels, approvedHostels, rejectedHostels }, recentHostels, recentUsers }` |
| `/api/admin/managers` | `GET` | Admin | View all registered managers | `{ count, managers: [...] }` *(supports `?search=`)* |
| `/api/admin/students` | `GET` | Admin | View all registered students | `{ count, students: [...] }` *(supports `?search=`)* |
| `/api/admin/hostels` | `GET` | Admin | View all hostels across all stages | `{ count, hostels: [...] }` *(supports `?status=` & `?search=`)* |
| `/api/admin/hostels/:id/approve` | `PUT` | Admin | Approve pending hostel application | `{ success: true, message, hostel }` |
| `/api/admin/hostels/:id/reject` | `PUT` | Admin | Reject application with reason | `{ success: true, message, hostel }` *(Body: `{ reason: string }`)* |

---

## 💻 6. Frontend Component & Page Architecture

### 6.1 State Management (`AuthContext.jsx`)
* Provides global reactive state: `user`, `token`, `isAuthenticated`, `isAdmin`, `login()`, `logout()`.
* Persists auth session in `localStorage` across page reloads.

### 6.2 Component Directory
* `components/Sidebar.jsx`: Collapsible navigation menu with active route tracking and role pill.
* `components/Navbar.jsx`: Header showing live Atlas DB connection status and quick logout.
* `components/DashboardCard.jsx`: Metric cards with custom gradients and counters.
* `components/Table.jsx`: Generic styled responsive table with search and empty states.
* `components/StatusBadge.jsx`: Status/Role pill badge with contextual Lucide icons.
* `components/Button.jsx`: Multi-variant button with built-in loading spinner.
* `components/RejectModal.jsx`: Modal capturing reason before rejecting a hostel.
* `components/ProtectedRoute.jsx`: Security guard restricting access based on JWT and role.

---

## 🔐 7. Credentials & Quick Testing Reference

### Default Master Admin:
* **Email**: `admin@hostel.com`
* **Password**: `AdminPassword@123`
* **Role**: `Admin`

### Default Hostel Managers:
* `vikram.manager@hostel.com` (Password: `Password@123`)
* `ramesh.manager@hostel.com` (Password: `Password@123`)

### Default Students:
* `rahul.student@hostel.com` (Password: `Password@123`)
* `ananya.student@hostel.com` (Password: `Password@123`)
* `priya.student@hostel.com` (Password: `Password@123`)

---

## 🚀 8. Running the Application Locally

### Step 1: Start the Backend Server
```bash
cd backend
node server.js
# Server running at: http://localhost:5000
```

### Step 2: Start the Frontend Dev Server
```bash
cd frontend
npm run dev
# Frontend running at: http://localhost:5173
```

### Step 3: Database Utilities
* **Seed Admin**: `node backend/utils/seedAdmin.js`
* **Clean & Reset Data**: `node backend/utils/cleanDatabase.js`

---

## 🔮 9. Next Sprints Roadmap (Phases 8 – 9)

* **Phase 8: Student Booking & Allocation System**
  * Student Dashboard (`/student/dashboard`) logic.
  * Explore Hostels with filters (City, Price, Gender, Amenities).
  * Booking Schema & Request Workflow (`Booking.js`).
* **Phase 9: Map, Complaints & Image Uploads**
  * Interactive Map Engine (Leaflet & OpenStreetMap) for hostel discovery.
  * Multer storage for hostel images & student ID proof.
  * Complaint lodging and status resolution lifecycle.
