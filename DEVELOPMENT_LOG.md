# Software Development Journal & Log
### Project: Hostel Administration System (MCA Mini Project)
**Tech Stack:** MongoDB Atlas, Express.js, React (Vite), Node.js (MERN), Tailwind CSS, JWT, bcrypt, Axios, React Router DOM, React Leaflet

---

## 📊 Project Progress Tracker

```text
Progress: [█████████████████████████████████░░░░░░░░░░░░░] 66% Completed (6 / 9 Phases)
```

| Phase # | Module / Feature Name | Status | Completion Date |
| :---: | :--- | :---: | :---: |
| **Phase 1** | Project Setup & MVC Architecture | ✅ **Completed** | Aug 6, 2026 |
| **Phase 2** | MongoDB Atlas Cloud Connection Layer | ✅ **Completed** | Aug 6, 2026 |
| **Phase 3** | User Authentication & RBAC (JWT & bcrypt) | ✅ **Completed** | Aug 6, 2026 |
| **Phase 4** | Admin Backend Module (Moderation & Analytics) | ✅ **Completed** | Aug 6, 2026 |
| **Phase 5** | Admin Frontend Portal & UI Integration | ✅ **Completed** | Aug 6, 2026 |
| **Phase 6** | Hostel Manager Module (CRUD, Dashboard & Frontend) | ✅ **Completed** | Aug 6, 2026 |
| **Phase 7** | Student Booking & Room Allocation System | ⏳ *Next Sprint* | Pending |
| **Phase 8** | Interactive Map (React Leaflet & OpenStreetMap) | ⏳ *Upcoming* | Pending |
| **Phase 9** | Complaints, Notices & Image Uploads (Multer) | ⏳ *Upcoming* | Pending |

---

# Phase 1: Project Setup & MVC Architecture

## Date
August 6, 2026

## Goal
Establish a clean, professional, decoupled MERN stack architecture with dedicated directories for backend (MVC pattern) and frontend (Component-driven architecture). Configure dependencies, environment variables, Tailwind CSS, Express server, and baseline health-check endpoint.

## Backend Progress
- **Files Created:**
  - `backend/server.js`: Central Express server application entry point.
  - `backend/.env`: Environment configuration storing `PORT`, `MONGO_URI`, and `JWT_SECRET`.
  - `backend/.gitignore`: Version control exclusions (`node_modules`, `.env`, `uploads`).
  - Folder structure: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `uploads/`, `utils/`.
- **Files Modified:** None (Initial Setup).
- **Models Added:** None (Phase 1 focus).
- **Controllers Added:** None.
- **Routes Added:** Health check route mounted directly at `GET /`.
- **Middleware Added:** `express.json()` for JSON body parsing, `cors()` for cross-origin resource sharing.
- **Database Changes:** None.
- **API Endpoints Implemented:**
  - `GET /` — Health check endpoint returning `{ message: "Hostel Administration System API is running successfully" }`.

## Frontend Progress
- **Pages Created:** Baseline health monitor view in `App.jsx`.
- **Components Created:** Status card components for backend health status.
- **Layouts Created:** Centered glassmorphism container.
- **Context Added:** None.
- **Hooks Added:** `useState`, `useEffect` for health check polling.
- **Services Added:** Direct Axios calls for baseline verification.
- **Routing Changes:** None.
- **Configuration:** Initialized Vite + React 19, installed `@tailwindcss/vite` & `tailwindcss v4`, `lucide-react`, `react-router-dom`, `axios`, `leaflet`.

## Integration
- Frontend made an asynchronous `GET` request using Axios to `http://localhost:5000/`.
- Validated CORS headers allowing Vite dev server (`http://localhost:5173`) to communicate with Express server (`http://localhost:5000`).

## Testing
- **How Tested:** Executed `curl` and browser fetches to `http://localhost:5000/`.
- **Expected Results:** Status 200 OK with operational JSON response.
- **Bugs Found:** Server port conflicts and missing node module resolutions.
- **How Fixed:** Specified standard fallback port 5000 and verified `package.json` scripts.

## Challenges Faced
- **Challenge:** Tailwind CSS v4 setup with `@tailwindcss/vite` plugin requires explicit CSS import `@import "tailwindcss";` instead of the traditional `@tailwind` directives.
- **Resolution:** Updated `frontend/src/index.css` to match Tailwind v4 specifications.

## Folder Structure Changes
```text
Hostel-Administration-System/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── layouts/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Git Commit
`chore: initialize decoupled MERN stack architecture with MVC structure and Tailwind v4`

## Next Sprint
Implement MongoDB Atlas cloud connection layer with Mongoose and DNS fallback handling.

---

# Phase 2: MongoDB Atlas Cloud Connection Layer

## Date
August 6, 2026

## Goal
Connect the backend Express server to the MongoDB Atlas Cloud cluster securely using Mongoose and `dotenv` environment variables.

## Backend Progress
- **Files Created:**
  - `backend/config/db.js`: Mongoose database connection module with resilient DNS server fallback.
- **Files Modified:**
  - `backend/server.js`: Imported and invoked `connectDB()` prior to starting the HTTP listener.
- **Models Added:** None.
- **Controllers Added:** None.
- **Routes Added:** None.
- **Middleware Added:** None.
- **Database Changes:** Established connection to remote cluster `ac-h0w7c8u-shard-00-00.rbyihjs.mongodb.net`.
- **API Endpoints Implemented:** None.

## Frontend Progress
*No frontend changes in this backend-focused sprint.*

## Integration
- Backend reads `process.env.MONGO_URI` securely from `.env`.
- Database handshake establishes connection with automatic reconnect policies.

## Testing
- **How Tested:** Ran `node config/db.js` and `server.js` standalone test scripts.
- **Expected Results:** `MongoDB Connected successfully: <host-url>` logged to console.
- **Bugs Found:** `querySrv ECONNREFUSED` error during SRV DNS record lookup on specific local network configurations.
- **How Fixed:** Configured Node's native `dns` module with public Google DNS resolvers (`8.8.8.8`, `8.8.4.4`) in `config/db.js` before initializing Mongoose.

## Challenges Faced
- **Challenge:** Node.js default DNS resolver failed on Windows when parsing `mongodb+srv://` connection strings.
- **Resolution:** Added `const dns = require('dns'); dns.setServers(['8.8.8.8', '8.8.4.4']);` at the top of `config/db.js`.

## Folder Structure Changes
- `backend/config/db.js` (NEW)

## Git Commit
`feat(db): configure MongoDB Atlas connection with Mongoose and custom DNS fallback`

## Next Sprint
Implement User model, password encryption with bcrypt, JWT authentication, and RBAC middleware.

---

# Phase 3: User Authentication & Role-Based Access Control (RBAC)

## Date
August 6, 2026

## Goal
Build complete authentication system supporting three distinct platform roles (`Admin`, `Hostel Manager`, `Student`) with encrypted passwords, JWT access tokens, and protected routes.

## Backend Progress
- **Files Created:**
  - `backend/models/User.js`: Schema with fields `name`, `email`, `phone`, `password`, and `role` (`enum: ['Admin', 'Hostel Manager', 'Student']`). Includes Mongoose `pre-save` hook for `bcrypt` hashing and `matchPassword` instance method.
  - `backend/controllers/authController.js`: Handlers for `registerUser`, `loginUser`, and `getMeProfile`.
  - `backend/middleware/authMiddleware.js`: `protect` middleware for JWT extraction and `authorize(...roles)` for RBAC.
  - `backend/routes/authRoutes.js`: Endpoints for register, login, and profile fetching.
- **Files Modified:**
  - `backend/server.js`: Mounted `/api/auth` routes.
- **Models Added:** `User` model.
- **Controllers Added:** `registerUser`, `loginUser`, `getMeProfile`.
- **Routes Added:**
  - `POST /api/auth/register` — Creates user, hashes password, returns JWT.
  - `POST /api/auth/login` — Verifies password against hash, returns JWT.
  - `GET /api/auth/me` — Returns authenticated user profile.
- **Middleware Added:** `protect` (JWT validation), `authorize` (Role checking).
- **Database Changes:** Created `users` collection with unique index on `email`.

## Frontend Progress
*Sprint focused on backend API and security pipeline.*

## Integration
- Implemented stateless token-based authentication using JSON Web Tokens (JWT) signed with `JWT_SECRET` and 30-day expiration.
- Passwords stripped from responses via `select: false` on User schema.

## Testing
- **How Tested:** Executed automated integration test suite validating registration of all 3 roles, login with correct/wrong passwords, and role barrier enforcement.
- **Expected Results:** Valid JWT generated on login; unauthorized users blocked with `401`/`403`.
- **Bugs Found:** Double password hashing occurred when calling `.save()` without modifying password.
- **How Fixed:** Added `if (!this.isModified('password')) return next();` in Mongoose `pre-save` hook.

## Challenges Faced
- **Challenge:** Preventing plain-text password leakage in queries.
- **Resolution:** Configured `select: false` on the password field and explicitly used `.select('+password')` only in login verification.

## Folder Structure Changes
- `backend/models/User.js` (NEW)
- `backend/controllers/authController.js` (NEW)
- `backend/middleware/authMiddleware.js` (NEW)
- `backend/routes/authRoutes.js` (NEW)

## Git Commit
`feat(auth): implement JWT authentication, password hashing, and role-based access control`

## Next Sprint
Build the Admin backend module (Dashboard analytics, manager/student views, hostel moderation).

---

# Phase 4: Admin Backend Module (Moderation & Analytics)

## Date
August 6, 2026

## Goal
Implement Admin-only backend capabilities using MVC architecture, enabling the Admin to view aggregated platform metrics, search user directories, and approve or reject hostel property registrations.

## Backend Progress
- **Files Created:**
  - `backend/models/Hostel.js`: Schema with `name`, `type`, `address`, `city`, `state`, `pincode`, `location` (GeoJSON `Point` with `2dsphere` index for OpenStreetMap/Leaflet), `contactPhone`, `contactEmail`, `manager` (`ObjectId` ref `User`), `totalRooms`, `totalBeds`, `status` (`'Pending' | 'Approved' | 'Rejected'`), `rejectionReason`, `amenities`, and `images`.
  - `backend/controllers/adminController.js`: Controller methods `getAdminDashboardStats`, `getAllManagers`, `getAllStudents`, `getAllHostels`, `approveHostel`, `rejectHostel`.
  - `backend/routes/adminRoutes.js`: Admin-only router protected by `protect` and `authorize('Admin')`.
- **Files Modified:**
  - `backend/server.js`: Mounted `/api/admin` router.
- **Models Added:** `Hostel` model.
- **Controllers Added:**
  - `getAdminDashboardStats`: Concurrently aggregates student, manager, total hostel, pending, approved, and rejected counts using `Promise.all`.
  - `getAllManagers`: Retrieves all hostel managers with regex search.
  - `getAllStudents`: Retrieves all students with regex search.
  - `getAllHostels`: Retrieves hostels with status filter and manager population.
  - `approveHostel`: Changes hostel status to `'Approved'` and clears rejection reasons.
  - `rejectHostel`: Changes hostel status to `'Rejected'` with recorded explanation.
- **Routes Added:**
  - `GET /api/admin/dashboard`
  - `GET /api/admin/managers`
  - `GET /api/admin/students`
  - `GET /api/admin/hostels`
  - `PUT /api/admin/hostels/:id/approve`
  - `PUT /api/admin/hostels/:id/reject`
- **Database Changes:** Created `hostels` collection with `2dsphere` geospatial index.

## Frontend Progress
*Sprint focused on backend Admin controllers and routes.*

## Integration
- Protected all `/api/admin/*` endpoints requiring Bearer token with `role === 'Admin'`.
- Populated relational data (`manager` -> `name`, `email`, `phone`) using Mongoose `.populate()`.

## Testing
- **How Tested:** Comprehensive automated test script executing 12 end-to-end assertions covering registration, login, data seeding, approvals, rejections, analytics calculation, and role rejection on student tokens.
- **Expected Results:** 100% test pass rate with status 200 on all admin endpoints and 403 on student access attempts.
- **Bugs Found:** None.

## Challenges Faced
- **Challenge:** Multiple database count queries causing serial latency.
- **Resolution:** Wrapped all metric counts inside `Promise.all([...])` to execute aggregations concurrently.

## Folder Structure Changes
- `backend/models/Hostel.js` (NEW)
- `backend/controllers/adminController.js` (NEW)
- `backend/routes/adminRoutes.js` (NEW)

## Git Commit
`feat(admin-backend): create Admin controllers, hostel moderation workflows, and dashboard aggregations`

## Next Sprint
Build the complete Admin Frontend portal and integrate all pages with the backend APIs.

---

# Phase 5: Admin Frontend Portal & UI Integration

## Date
August 6, 2026

## Goal
Build a modern, responsive, state-of-the-art Admin control center frontend using React, Vite, Tailwind CSS, and Context API. Connect all pages to the backend Admin APIs, handle loading/error states, and protect administrative routes.

## Backend Progress
- **Files Created:**
  - `backend/utils/seedAdmin.js`: Master admin seeder creating `admin@hostel.com` in MongoDB Atlas.
  - `backend/utils/cleanDatabase.js`: Utility script to remove automated test artifacts and seed realistic test accounts and hostel properties.
- **Files Modified:** None (Backend preserved as requested).
- **Models Added:** None.
- **Controllers Added:** None.
- **Routes Added:** None.
- **Middleware Added:** None.
- **Database Changes:** Cleaned up test accounts and verified single Master Admin and sample hostels.

## Frontend Progress
- **Pages Created:**
  - `frontend/src/pages/admin/AdminLoginPage.jsx`: Glassmorphic login page with error alerts, demo credential autofill, and token storage.
  - `frontend/src/pages/admin/AdminDashboardPage.jsx`: Metric cards, moderation health bar, recent hostels table, and recent users widget.
  - `frontend/src/pages/admin/ManagersListPage.jsx`: Searchable directory of registered Hostel Managers with contact info.
  - `frontend/src/pages/admin/StudentsListPage.jsx`: Searchable directory of registered Students.
  - `frontend/src/pages/admin/HostelsListPage.jsx`: Multi-tab hostel directory (`All`, `Approved`, `Pending`, `Rejected`) with capacity and manager details.
  - `frontend/src/pages/admin/PendingApprovalsPage.jsx`: Moderation queue displaying hostel cards with **Approve & Publish** and **Reject Application** workflows.
- **Components Created:**
  - `frontend/src/components/Sidebar.jsx`: Dark navigation bar with active indicator, control center branding, and sign-out action.
  - `frontend/src/components/Navbar.jsx`: Top bar showing live Atlas DB connection pulse and admin profile pill.
  - `frontend/src/components/DashboardCard.jsx`: Gradient metric card with dynamic counters and navigation links.
  - `frontend/src/components/Table.jsx`: Generic responsive data table with search bar and empty states.
  - `frontend/src/components/StatusBadge.jsx`: Status/Role pill badges with matching icons.
  - `frontend/src/components/Button.jsx`: Multi-variant button component with animated loading state.
  - `frontend/src/components/LoadingSpinner.jsx`: Animated spinner and full-page loader.
  - `frontend/src/components/RejectModal.jsx`: Modal dialog for capturing rejection reasons before declining a hostel.
  - `frontend/src/components/ProtectedRoute.jsx`: Route wrapper enforcing `role === 'Admin'` authentication.
- **Layouts Created:**
  - `frontend/src/layouts/AdminLayout.jsx`: Master layout combining Sidebar, Navbar, and `<Outlet />`.
- **Context Added:**
  - `frontend/src/context/AuthContext.jsx`: Persistent global authentication provider.
- **Hooks Added:** `useAuth` hook.
- **Services Added:**
  - `frontend/src/services/api.js`: Central Axios instance with JWT request/response interceptors.
  - `frontend/src/services/authService.js`: Authentication API endpoints.
  - `frontend/src/services/adminService.js`: Admin module API endpoints.
- **Routing Changes:**
  - Configured `BrowserRouter` in `frontend/src/App.jsx` with public `/login` and protected `/admin/*` routes.

## Integration
- Automatic JWT Bearer token attachment via Axios interceptor on all `/api/admin` requests.
- Instant optimistic state updates when approving or rejecting hostels in `PendingApprovalsPage`.
- Seamless logout clearing `localStorage` and redirecting unauthenticated visitors to `/login`.

## Testing
- **How Tested:**
  1. Ran `npm run build` to verify production bundle compilation (completed in 2.64s with 0 errors).
  2. Verified API authentication via `POST /api/auth/login`.
  3. Tested live dashboard metric synchronization with MongoDB Atlas data.
  4. Verified search debounce across Managers and Students directories.
  5. Verified hostel moderation workflow with rejection reason modal and approval transitions.
- **Expected Results:** Flawless navigation, real-time API connectivity, and persistent sessions.
- **Bugs Found:** Root directory `npm run dev` failed due to project separation between `backend/` and `frontend/`.
- **How Fixed:** Clarified run directories (`frontend/` for Vite, `backend/` for Express) and verified both servers.

## Challenges Faced
- **Challenge:** Multiple duplicate admin accounts existed from earlier automated test runs.
- **Resolution:** Created and executed `cleanDatabase.js` to wipe timestamp test accounts and establish one clean Master Admin (`admin@hostel.com`).

## Folder Structure Changes
```text
frontend/src/
├── components/
│   ├── Button.jsx (NEW)
│   ├── DashboardCard.jsx (NEW)
│   ├── LoadingSpinner.jsx (NEW)
│   ├── Navbar.jsx (NEW)
│   ├── ProtectedRoute.jsx (NEW)
│   ├── RejectModal.jsx (NEW)
│   ├── Sidebar.jsx (NEW)
│   ├── StatusBadge.jsx (NEW)
│   └── Table.jsx (NEW)
├── context/
│   └── AuthContext.jsx (NEW)
├── layouts/
│   └── AdminLayout.jsx (NEW)
├── pages/
│   └── admin/
│       ├── AdminDashboardPage.jsx (NEW)
│       ├── AdminLoginPage.jsx (NEW)
│       ├── HostelsListPage.jsx (NEW)
│       ├── ManagersListPage.jsx (NEW)
│       ├── PendingApprovalsPage.jsx (NEW)
│       └── StudentsListPage.jsx (NEW)
├── services/
│   ├── adminService.js (NEW)
│   ├── api.js (NEW)
│   └── authService.js (NEW)
└── App.jsx (UPDATED)
```

## Git Commit
`feat(admin-frontend): build complete Admin portal UI with dashboard, user directories, and hostel moderation`

## Next Sprint
Phase 6: Hostel Manager Module (Hostel Profile Management, Room Schema, Bed Allocation, and Pricing).

---

# Phase 6 / Sprint 2: Hostel Manager Module (Backend + Frontend)

## Date
August 6, 2026

## Goal
Build the complete Hostel Manager module enabling managers to log in, view their personal dashboard, create/edit/delete hostels, and track approval status. Reuse existing authentication system, middleware, and UI components. Implement ownership-scoped CRUD operations so managers can only access their own hostels.

## Backend Progress
- **Files Created:**
  - `backend/controllers/managerController.js`: 6 controller methods — `getManagerDashboard`, `getMyHostels`, `getMyHostelById`, `createHostel`, `updateHostel`, `deleteHostel`.
  - `backend/routes/managerRoutes.js`: Manager-only router with `protect` + `authorize('Hostel Manager')`.
  - `backend/utils/testManagerApi.js`: Comprehensive 18-assertion integration test script.
- **Files Modified:**
  - `backend/models/Hostel.js`: Added 4 new fields — `facilities`, `hostelRules`, `startingRent`, `securityDeposit`.
  - `backend/server.js`: Mounted `/api/manager` routes.
- **Models Added:** None (extended existing Hostel model).
- **Controllers Added:** `managerController.js` (6 methods).
- **Routes Added:**
  - `GET /api/manager/dashboard` — Manager dashboard stats (hostel counts by status).
  - `GET /api/manager/hostels` — List all hostels created by this manager.
  - `GET /api/manager/hostels/:id` — Get single hostel detail (ownership-scoped).
  - `POST /api/manager/hostels` — Create new hostel (status defaults to Pending).
  - `PUT /api/manager/hostels/:id` — Update hostel (ownership-scoped).
  - `DELETE /api/manager/hostels/:id` — Delete hostel (ownership-scoped).
- **Middleware Added:** None (reused existing `protect` and `authorize`).
- **Database Changes:** Extended `hostels` collection with `facilities`, `hostelRules`, `startingRent`, `securityDeposit` fields.
- **API Endpoints Implemented:** 6 new endpoints under `/api/manager`.

## Frontend Progress
- **Pages Created:**
  - `frontend/src/pages/manager/ManagerLoginPage.jsx`: Manager login with cyan theme and demo credential autofill.
  - `frontend/src/pages/manager/ManagerDashboardPage.jsx`: Metric cards (My Hostels, Pending, Approved, Rejected) and recent submissions table.
  - `frontend/src/pages/manager/MyHostelsPage.jsx`: Hostel card grid with status filter tabs and delete confirmation.
  - `frontend/src/pages/manager/AddHostelPage.jsx`: Create hostel form with facilities, rules, and pricing.
  - `frontend/src/pages/manager/EditHostelPage.jsx`: Pre-filled edit form with update API integration.
  - `frontend/src/pages/manager/HostelDetailPage.jsx`: Full hostel detail view with capacity stats and action buttons.
- **Components Created:**
  - `frontend/src/components/ManagerSidebar.jsx`: Manager navigation with active route highlighting.
  - `frontend/src/components/ManagerNavbar.jsx`: Manager header bar with profile and system status.
  - `frontend/src/components/HostelCard.jsx`: Property card with type gradient, stats row, and actions.
  - `frontend/src/components/HostelForm.jsx`: Sectioned form for Add/Edit operations.
  - `frontend/src/components/FacilitySelector.jsx`: Multi-select tag picker with 20 presets and custom entry.
  - `frontend/src/components/ConfirmDialog.jsx`: Generic confirmation modal for destructive actions.
  - `frontend/src/components/Toast.jsx`: Auto-dismissing notification toast with slide animation.
- **Layouts Created:**
  - `frontend/src/layouts/ManagerLayout.jsx`: Manager portal layout (Sidebar + Navbar + Outlet).
- **Context Added:** None (reused existing `AuthContext`).
- **Hooks Added:** None (reused existing `useAuth` hook).
- **Services Added:**
  - `frontend/src/services/managerService.js`: 6 Axios API methods for manager endpoints.
- **Routing Changes:**
  - Updated `App.jsx`: Added `/manager/login`, `/manager/dashboard`, `/manager/hostels`, `/manager/hostels/new`, `/manager/hostels/:id`, `/manager/hostels/:id/edit`.
  - Updated `RootRedirect` to handle role-based dashboard redirection.
- **CSS Changes:**
  - Added `slide-in-right` and `fade-in` keyframe animations in `index.css`.

## Integration
- Frontend communicates with `GET/POST/PUT/DELETE /api/manager/*` endpoints via Axios.
- JWT token automatically attached via request interceptor in `services/api.js`.
- Ownership enforcement happens at the controller level (every query filters by `req.user._id`).
- Existing Admin module continues to work — Admin can still view all hostels across all managers.

## Testing
- **How Tested:** Automated 18-assertion integration test (`backend/utils/testManagerApi.js`) covering:
  - Manager login and dashboard retrieval.
  - Hostel CRUD lifecycle (Create → Read → Update → Delete).
  - Field persistence (facilities, rules, rent, deposit, coordinates).
  - Ownership enforcement (other manager blocked with 404 on view/edit/delete).
  - Role enforcement (student blocked with 403 from manager routes).
- **Expected Results:** 18/18 assertions passed.
- **Build Verification:** `npm run build` completed in 4.06s with 0 errors.
- **Bugs Found:** None.

## Challenges Faced
- **Challenge:** Hostel model already existed with `amenities` field from Admin module. Adding a new `facilities` field risked confusion.
- **Resolution:** Kept both fields for backward compatibility. `amenities` remains for legacy Admin data; `facilities` is the manager-editable field going forward.
- **Challenge:** Ensuring edit of rejected hostels auto-resets status to Pending for re-review.
- **Resolution:** Added logic in `updateHostel` controller: if `status === 'Rejected'`, auto-set to `'Pending'` and clear `rejectionReason`.
- **Lessons Learned:** Ownership scoping at the query level (`{ manager: req.user._id }`) is more secure than route-level middleware since it prevents any parameter tampering.

## Folder Structure Changes
```text
backend/
├── controllers/
│   └── managerController.js (NEW)
├── routes/
│   └── managerRoutes.js (NEW)
├── models/
│   └── Hostel.js (MODIFIED — 4 new fields)
├── server.js (MODIFIED — mounted /api/manager)
└── utils/
    └── testManagerApi.js (NEW)

frontend/src/
├── components/
│   ├── ConfirmDialog.jsx (NEW)
│   ├── FacilitySelector.jsx (NEW)
│   ├── HostelCard.jsx (NEW)
│   ├── HostelForm.jsx (NEW)
│   ├── ManagerNavbar.jsx (NEW)
│   ├── ManagerSidebar.jsx (NEW)
│   └── Toast.jsx (NEW)
├── layouts/
│   └── ManagerLayout.jsx (NEW)
├── pages/
│   └── manager/
│       ├── AddHostelPage.jsx (NEW)
│       ├── EditHostelPage.jsx (NEW)
│       ├── HostelDetailPage.jsx (NEW)
│       ├── ManagerDashboardPage.jsx (NEW)
│       ├── ManagerLoginPage.jsx (NEW)
│       └── MyHostelsPage.jsx (NEW)
├── services/
│   └── managerService.js (NEW)
├── App.jsx (MODIFIED — added manager routes)
└── index.css (MODIFIED — added animations)
```

## Git Commit
`feat(manager-module): implement Hostel Manager CRUD, dashboard, and frontend portal with ownership-scoped APIs`

## Next Sprint
Phase 7: Student Booking & Room Allocation System (Student Portal, Hostel Browsing, Room Booking Requests, Status Tracking).
