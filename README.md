# ACCIO — Campus Lost & Found Portal

A full-stack web application to report, match, and return lost & found items on campus.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io

## Folder Structure
```
accio/
├── server/          # Node.js + Express backend
│   ├── models/      # MongoDB models (User, Item, Notification, Message)
│   ├── routes/      # API routes (auth, items, admin, notifications, messages, reports)
│   ├── services/    # Matching engine
│   ├── middleware/  # JWT auth, admin guard
│   ├── uploads/     # Uploaded images
│   └── server.js   # Entry point
└── client/          # React (Vite) frontend
    └── src/
        ├── context/    # AuthContext (JWT + Socket.io)
        ├── pages/      # All page components
        ├── components/ # Navbar, ItemCard
        └── services/   # Axios API service
```

## Setup Instructions

### 1. Install MongoDB
Make sure MongoDB is installed and running locally on port 27017.
- Download: https://www.mongodb.com/try/download/community

### 2. Start the Backend
```bash
cd server
npm install
npm run dev
```
Backend runs on **http://localhost:5000**

### 3. Start the Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

## Environment Variables
The `server/.env` file is pre-configured with:
```
MONGODB_URI=mongodb://localhost:27017/accio_lostandfound
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
ADMIN_CODE=ACCIO_ADMIN_2024
```

## Admin Access
To create an admin account:
1. Go to **Signup page**
2. Click **"Admin Code"** toggle
3. Enter: `ACCIO_ADMIN_2024`

## Features
- ✅ Secure JWT authentication (Login/Register)
- ✅ Report Lost & Found items with image upload
- ✅ Intelligent matching engine (name + location + time + attributes)
- ✅ Real-time notifications (Socket.io)
- ✅ Admin panel with field visibility control
- ✅ Live chat between matched users
- ✅ Analytics dashboard with charts
- ✅ Item status tracking (Lost → Found → Matched → Returned)
- ✅ Search, filter, and sort items
