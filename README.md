# 🚀 TaskFlowHub

A modern, full-stack task management platform with real-time collaboration, Google OAuth, and a beautiful UI.

---

## ✨ Features

- 🔒 **Google OAuth Authentication** — Secure login with Google
- 📝 **Task Management** — Create, edit, delete, and share tasks
- 👥 **Collaboration** — Real-time updates and sharing with team members
- 📊 **Dashboard & Analytics** — Visualize your productivity
- ⚡ **Live Updates** — Powered by Socket.io
- 📱 **Responsive UI** — Built with React 19 & Tailwind CSS
- 🛡️ **Security** — JWT, rate limiting, input validation, CORS
- 📧 **Email Notifications** — Stay updated on task changes

---

## 🖥️ Tech Stack

- **Frontend:** React 19, Tailwind CSS, React Router, Axios, Socket.io-client
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, Google OAuth
- **Deployment:** Vercel (frontend), Railway (backend)

---

## 🏗️ Project Structure

```
taskflowhub/
├── backend/   # Express.js API, MongoDB, Socket.io
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── sockets/
│       ├── utils/
│       ├── app.js
│       └── server.js
└── frontend/  # React 19, Tailwind CSS, Socket.io-client
    └── src/
        ├── components/
        ├── contexts/
        ├── App.jsx
        ├── index.jsx
        └── index.css
```

---

## ⚡ Quick Start

### 1. **Clone the Repository**

```bash
git clone https://github.com/YOUR_USERNAME/taskflowhub.git
cd taskflowhub
```

### 2. **Backend Setup (Railway)**

- Node.js v16+
- MongoDB Atlas account
- Google OAuth credentials

```bash
cd backend
npm install
```

**Environment Variables (set in Railway dashboard):**

| Variable                | Description                        |
|-------------------------|------------------------------------|
| `MONGODB_URI`           | MongoDB connection string          |
| `JWT_SECRET`            | JWT signing secret                 |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID             |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth client secret         |
| `FRONTEND_URL`          | Your Vercel frontend URL           |

**Start locally:**
```bash
npm run dev
```

### 3. **Frontend Setup (Vercel)**

- Node.js 18+
- Backend server running

```bash
cd ../frontend
npm install
```

**Environment Variables (set in Vercel dashboard):**

| Variable                    | Description                        |
|-----------------------------|------------------------------------|
| `REACT_APP_API_URL`         | Backend API URL (e.g. `https://your-backend.up.railway.app/api`) |
| `REACT_APP_GOOGLE_CLIENT_ID`| Google OAuth client ID             |

**Start locally:**
```bash
npm start
```
App runs at [http://localhost:3000](http://localhost:3000)

---

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add these to **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://your-app.vercel.app`
4. Copy the Client ID and Secret to your Railway and Vercel environment variables

---

## 🌐 API Overview

**Base URL:**  
`https://your-backend.up.railway.app/api`

**Authentication**
- `POST /auth/google` — Login with Google OAuth
- `POST /auth/refresh` — Refresh JWT token
- `GET /auth/profile` — Get user profile
- `POST /auth/logout` — Logout

**Tasks**
- `GET /tasks` — List tasks
- `POST /tasks` — Create task
- `GET /tasks/:id` — Task details
- `PUT /tasks/:id` — Update task
- `DELETE /tasks/:id` — Delete task
- `POST /tasks/:id/share` — Share task
- `GET /tasks/stats` — Task statistics

**Users**
- `GET /users/profile` — Get profile
- `PUT /users/profile` — Update profile

---

## 🧪 Testing

- Backend: `npm test` (Jest, Supertest)
- Frontend: `npm test` (React Testing Library)

---

## 🚀 Deployment

### **Backend (Railway)**
- Push to GitHub, connect to Railway, set environment variables, deploy.

### **Frontend (Vercel)**
- Push to GitHub, connect to Vercel, set environment variables, deploy.

---

## 📝 License

MIT License — see [LICENSE](./LICENSE)

---

## 🙏 Acknowledgments

- Express.js, MongoDB, Socket.io, React, Tailwind CSS, Google Cloud, and all contributors.

---

## ⭐ Star this repo if you like it! 