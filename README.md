# Unistay — Hostel Administration System

Unistay is a comprehensive MERN stack application designed to manage hostel properties, room allocations, student bookings, complaints, and administrative moderation.

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_here
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Admin Access
To access the Admin dashboard, you can register a new user with the role "Student" or "Hostel Manager", and manually change their role to `Admin` in your MongoDB Atlas database collection. Subsequent administrators can only be managed by existing administrators.
