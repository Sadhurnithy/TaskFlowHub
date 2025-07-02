# 🚀 Todo Task Manager Backend API

A robust, scalable backend API for a modern todo task management application with real-time collaboration features.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure user authentication
- 📋 **Task Management** - CRUD operations for tasks
- 👥 **Task Sharing** - Collaborate with team members
- 📊 **Real-time Updates** - Socket.io for live updates
- 📈 **Analytics** - Task statistics and user insights
- 🔒 **Rate Limiting** - API protection against abuse
- 🛡️ **Security** - JWT tokens, input validation, CORS
- 📧 **Email Notifications** - Task sharing and update alerts

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Google OAuth
- **Real-time**: Socket.io
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/todo-task-app-backend.git
   cd todo-task-app-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your credentials:
   - MongoDB connection string
   - Google OAuth credentials
   - JWT secret

4. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Key Endpoints

#### 🔐 Authentication
- `POST /auth/google` - Login with Google OAuth
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout user

#### 📋 Tasks
- `GET /tasks` - Get all tasks (with filters)
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get specific task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/share` - Share task
- `GET /tasks/stats` - Get task statistics
- `GET /tasks/overdue` - Get overdue tasks

#### 👤 Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/search` - Search users
- `GET /users/stats` - Get user statistics

## 🧪 Testing

See [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test
```bash
curl http://localhost:5000/api/health
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middlewares/     # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── sockets/         # Socket.io handlers
├── utils/           # Utility functions
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## 🔌 Real-time Features

The API includes Socket.io for real-time features:
- Live task updates
- Real-time notifications
- Collaborative editing
- Typing indicators

## 🚀 Deployment

### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Docker
```bash
docker build -t todo-backend .
docker run -p 5000:5000 todo-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👨‍💻 Author

Your Name - [GitHub](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- Socket.io team
- All contributors

---

⭐ **Star this repository if you found it helpful!** 