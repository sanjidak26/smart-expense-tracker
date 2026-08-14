# 💰 Smart Expense Tracker

[🌐 Live Demo](https://smart-expense-tracker-nine-peach.vercel.app) | [💻 GitHub Repository](https://github.com/sanjidak26/smart-expense-tracker)

# Smart Expense Tracker

A modern, full-stack personal finance and expense tracking application built on the MERN stack.

## Tech Stack
- **Frontend**: React 19 (Vite), Tailwind CSS 3, Axios, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JSON Web Token (JWT)

---

## Folder Structure
```text
SmartExpenseTracker/
├── backend/                  # Node.js + Express.js API
│   ├── config/               # Database connections (Mongoose)
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Express custom middleware (Auth, Errors)
│   ├── models/               # Mongoose Schemas (User)
│   ├── routes/               # API route definitions
│   ├── utils/                # Helper functions & utilities
│   ├── app.js                # Express middleware & setups
│   └── server.js             # Express server entry point
├── frontend/                 # React client (Vite)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # Images, logo assets
│   │   ├── components/       # Reusable layout/UI components
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page view screens
│   │   ├── services/         # Axios API connection endpoints
│   │   ├── utils/            # Helper utilities (currency formatters, etc)
│   │   ├── App.jsx           # Main React component
│   │   └── index.css         # Tailwind injection file
│   └── vite.config.js        # Configures port 3000 and /api proxy
```

---

## Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI

---

## Getting Started

### 1. Clone & Open
Navigate to the root directory `SmartExpenseTracker`.

### 2. Configure Environment Variables
Environment templates have been configured for both frontend and backend.

#### Backend Env Setup
Create a `.env` file in the `backend/` directory:
```bash
# In backend/ directory
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-expense-tracker
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

#### Frontend Env Setup
Create a `.env` file in the `frontend/` directory:
```bash
# In frontend/ directory
VITE_API_URL=/api
```

---

## How to Run the Project

You will need to open two separate terminal windows or run them concurrently.

### Terminal 1: Backend
Go to the `backend` folder, install dependencies, and run the developer daemon:
```bash
cd backend
npm install
npm run dev
```
*The API will start on **http://localhost:5000**, checking connection to MongoDB.*

### Terminal 2: Frontend
Go to the `frontend` folder, install dependencies, and run the Vite compiler:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
*The client app will launch at **http://localhost:3000**. The proxy in `vite.config.js` will automatically redirect requests starting with `/api` to the backend on port 5000.*
