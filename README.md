# Campus Digital Twin — Production MERN Rebuild

A professional, standalone institution management platform built with the MERN stack (MongoDB, Express, React, Node.js). This version replaces all legacy mock data and platform dependencies with a real full-stack architecture.

## 🚀 Key Features

*   **Real-time Institutional Data**: Manage blocks, floors, and rooms with persistent MongoDB storage.
*   **Architectural Navigator**: Multi-level hierarchy (Campus > Block > Floor > Room) with real-time status.
*   **Security & Authentication**: Genuine JWT-based auth with role-based access control (Admin & User).
*   **Asset Management**: Centralized tracking for facilities (AC, Projectors, Labs) and maintenance logs.
*   **Departmental Directory**: Academic and administrative governance registry.
*   **Admin Suite**: Full CRUD operations for all institutional entities + dashboard metrics.

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios.
*   **Backend**: Node.js, Express.js, JWT, Bcrypt.js.
*   **Database**: MongoDB (Mongoose ODM).

---

## 💻 Local Setup Instructions

### 1. Database Initialization
Ensure your local **MongoDB Server** is running on port `27017`. Run the seed script from the root to populate the initial campus structure and accounts:

```bash
npm run seed
```

### 2. Environment Variables
The project is pre-configured with local defaults, but you can customize them in the `.env` files:

*   **Backend (`backend/.env`)**:
    *   `PORT=5000`
    *   `MONGO_URI=mongodb://127.0.0.1:27017/campus-twin`
    *   `JWT_SECRET=campus_twin_jwt_secret_key_2026`
*   **Frontend (`frontend/.env`)**:
    *   `VITE_API_URL=http://localhost:5000/api`

### 3. Running the Platform
Install all dependencies and launch both servers concurrently:

```bash
npm run install:all
npm run dev
```

Visit **http://localhost:5173** to launch the digital twin.

---

## 🔑 Demo Accounts

Use these credentials to explore the different access levels:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | `admin123` | Full control + Dashboard |
| **Standard User** | `user@campus.edu` | `user123` | Institutional Read-only |

---

## 📡 API Reference

The backend exposes a comprehensive RESTful API under the `/api` prefix:

*   `POST /api/auth/login`: Authenticate and receive JWT.
*   `GET /api/dashboard/stats`: Retrieve institutional aggregate metrics.
*   `GET /api/blocks`: List all building infrastructures.
*   `GET /api/rooms?floorId=...`: Search and filter workspace units.
*   `PUT /api/campus`: Update institution metadata (Admin only).

---

## 🏗️ Production Deployment

### Frontend (Vercel)
1. Push the `frontend` folder to GitHub.
2. Deploy to Vercel and set the `VITE_API_URL` to your production backend.

### Backend (Render)
1. Push the `backend` folder to GitHub.
2. Deploy as a Web Service on Render.
3. Configure your production MongoDB URI (e.g., MongoDB Atlas) in the environment variables.

---

*© 2026 Campus Twin Platform. Rebuilt as an independent standalone system.*
