# Campus Digital Twin — Sri Shakthi Institute of Engineering & Technology

A professional, standalone digital twin and smart campus management platform built with the MERN stack (MongoDB, Express, React, Node.js).

---

## 🌐 Live Application URLs

* **Frontend App (Vercel)**: [https://campus-digital-twin-ruby.vercel.app](https://campus-digital-twin-ruby.vercel.app)
* **Backend API (Render)**: [https://campus-digital-twin.onrender.com](https://campus-digital-twin.onrender.com)
* **Health Check**: [https://campus-digital-twin.onrender.com/health](https://campus-digital-twin.onrender.com/health)

---

## 🚀 Key Features

* **Interactive Indoor Digital Twin & Navigation**: Live floor plan mapping, room routing, and classroom occupancy tracking.
* **Real-time Institutional Data**: Manage blocks, floors, and rooms with persistent MongoDB Atlas storage.
* **User Registration & Role-Based Access Control**:
  * **Public Registration**: Self-service user registration (`role: user`) to access the dashboard and campus twin.
  * **Admin Governance**: Previous administrators can manage personnel and assign new administrator access (`role: admin`).
* **Asset & Facility Management**: Track labs, smart boards, projectors, and departmental assets with maintenance logs.
* **Campus & Departmental Directory**: Comprehensive academic registry and room details.
* **Live Dashboard & Metrics**: Real-time room status breakdowns, recent activity auditing, and quick navigation.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, React Router DOM, Axios.
* **Backend**: Node.js, Express.js, JWT Authentication, Bcrypt.js, Express Mongo Sanitize, Helmet.
* **Database**: MongoDB Atlas (Mongoose ODM).
* **Hosting**: Vercel (Frontend), Render (Backend).

---

## 🔑 Initial Credentials

You can create your own account using the **Register** option on the site, or log in with initial accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | `admin123` | Full Administrative & System Control |
| **Standard User** | `user@campus.edu` | `user123` | Campus Navigation & Overview |

---

## 💻 Local Setup Instructions

### 1. Database Initialization
Ensure your MongoDB connection string is set in `backend/.env`. Seed initial campus structure and default accounts:

```bash
cd backend
npm run seed
```

### 2. Environment Variables

* **Backend (`backend/.env`)**:
  ```env
  PORT=5000
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=campus_twin_jwt_secret_key_2026
  NODE_ENV=production
  ```

* **Frontend (`frontend/.env`)**:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

### 3. Running the App Locally

* **Backend**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```

* **Frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

Visit **http://localhost:5173** in your browser.

---

## 📡 API Reference

The backend exposes a RESTful API under the `/api` prefix:

* `POST /api/auth/register`: Public registration for standard users.
* `POST /api/auth/login`: Authenticate user and return JWT.
* `GET /api/auth/me`: Get current authenticated user details.
* `GET /api/dashboard/stats`: Retrieve aggregate metrics and live activity logs.
* `GET /api/blocks`: List all building infrastructures.
* `GET /api/rooms`: List and search classrooms/labs.
* `POST /api/users`: Admin creation of new users or administrators.

---

## 🏗️ Production Deployment Details

* **Frontend**: Hosted on Vercel with SPA rewrite rules (`frontend/vercel.json`) pointing to `index.html`.
* **Backend**: Hosted on Render as a Web Service connected to MongoDB Atlas.

---

*© 2026 Campus Twin Platform.*
