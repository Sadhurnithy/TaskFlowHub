# Todo Task App

A modern, full-stack todo task management application built with React, Node.js, MongoDB, and Socket.io for real-time collaboration.

## 🚀 Features

### Frontend (React)
- **Modern React 19** with JSX syntax
- **Google OAuth Authentication** - Secure login with Google accounts
- **Real-time Updates** - Live task updates using Socket.io
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Task Management** - Create, edit, delete, and share tasks
- **Dashboard** - Overview with statistics and recent tasks
- **User Profile** - Manage account settings and preferences
- **Task Sharing** - Collaborate with team members
- **Search & Filters** - Find tasks quickly with advanced filtering

### Backend (Node.js)
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT Authentication** - Secure token-based authentication
- **Google OAuth** - Third-party authentication
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Request validation with Joi
- **Error Handling** - Comprehensive error management

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern JSX syntax
- **React Router v7** - Client-side routing
- **Tailwind CSS v3** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time communication
- **Heroicons** - Beautiful SVG icons
- **Headless UI** - Accessible UI components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **JWT** - JSON Web Tokens for authentication
- **Google Auth** - OAuth 2.0 authentication
- **Joi** - Schema validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
todo-task-app/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── sockets/        # Socket.io handlers
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── README.md
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── README.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account or local MongoDB
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/todo-task-app.git
   cd todo-task-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file with your Google OAuth client ID
   npm start
   ```

### Environment Configuration

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`
6. Add redirect URIs: `http://localhost:3000`

## 📱 Features Overview

### Authentication
- **Google OAuth** - One-click login with Google accounts
- **JWT Tokens** - Secure session management
- **Auto-logout** - Automatic logout on token expiration

### Task Management
- **Create Tasks** - Modal form with all task details
- **Edit Tasks** - Inline editing capabilities
- **Delete Tasks** - Confirmation before deletion
- **Status Updates** - Quick status changes
- **Priority Levels** - High, Medium, Low priorities
- **Due Dates** - Set and track deadlines
- **Tags** - Organize tasks with custom tags

### Collaboration
- **Task Sharing** - Share tasks with team members
- **Permission Levels** - Read-only or read-write access
- **Real-time Updates** - Live updates across all users
- **Activity Feed** - Track task changes

### Dashboard
- **Statistics Cards** - Overview of task counts and status
- **Recent Tasks** - Quick access to latest tasks
- **Overdue Tasks** - Highlighted overdue items
- **Quick Actions** - Create new tasks directly

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Tasks
- `GET /api/tasks` - Get tasks with filters
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/share` - Share task
- `GET /api/tasks/stats` - Get task statistics

### Users
- `PUT /api/users/profile` - Update user profile

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run build
```

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, Railway hosting
- Set environment variables
- Configure MongoDB connection

### Frontend Deployment
- Deploy to Netlify, Vercel, or any static hosting
- Set environment variables
- Configure API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the backend README for API documentation
- Review the frontend README for component details
- Ensure all dependencies are properly installed
- Verify Google OAuth configuration

## 🔄 Updates

This project has been completely rewritten with modern React 19 JSX syntax and follows best practices for both frontend and backend development.

---

**Built with ❤️ using React, Node.js, and MongoDB** 