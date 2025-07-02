# TodoApp Frontend

A modern React frontend for the TodoApp task management system, built with React 19, Tailwind CSS, and Socket.io for real-time updates.

## 🚀 Features

- **Modern React 19** with JSX syntax
- **Google OAuth Authentication** - Secure login with Google accounts
- **Real-time Updates** - Live task updates using Socket.io
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Task Management** - Create, edit, delete, and share tasks
- **Dashboard** - Overview with statistics and recent tasks
- **User Profile** - Manage account settings and preferences
- **Task Sharing** - Collaborate with team members
- **Search & Filters** - Find tasks quickly with advanced filtering

## 🛠️ Tech Stack

- **React 19** - Latest React with modern JSX syntax
- **React Router v7** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time communication
- **Heroicons** - Beautiful SVG icons
- **Headless UI** - Accessible UI components

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── Login.jsx              # Google OAuth login
│   ├── common/
│   │   └── LoadingSpinner.jsx     # Reusable loading component
│   ├── dashboard/
│   │   └── Dashboard.jsx          # Main dashboard with stats
│   ├── layout/
│   │   └── Navbar.jsx             # Navigation bar
│   ├── profile/
│   │   └── Profile.jsx            # User profile management
│   └── tasks/
│       ├── CreateTaskModal.jsx    # Task creation modal
│       ├── TaskCard.jsx           # Individual task display
│       ├── TaskDetail.jsx         # Detailed task view
│       └── TaskList.jsx           # Task list with filters
├── contexts/
│   ├── AuthContext.jsx            # Authentication state
│   ├── SocketContext.jsx          # Socket.io connection
│   └── TaskContext.jsx            # Task management state
├── App.jsx                        # Main application component
├── index.jsx                      # Application entry point
└── index.css                      # Global styles with Tailwind
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-task-app/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google OAuth**
   - Update the Google Client ID in `src/components/auth/Login.jsx`
   - Replace `'YOUR_GOOGLE_CLIENT_ID'` with your actual Google OAuth client ID

4. **Start the development server**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000` to authorized origins
6. Copy the Client ID and update it in the Login component

## 📱 Features Overview

### Authentication
- **Google OAuth** - One-click login with Google accounts
- **JWT Tokens** - Secure session management
- **Auto-logout** - Automatic logout on token expiration

### Dashboard
- **Statistics Cards** - Overview of task counts and status
- **Recent Tasks** - Quick access to latest tasks
- **Overdue Tasks** - Highlighted overdue items
- **Quick Actions** - Create new tasks directly from dashboard

### Task Management
- **Create Tasks** - Modal form with all task details
- **Edit Tasks** - Inline editing capabilities
- **Delete Tasks** - Confirmation before deletion
- **Status Updates** - Quick status changes
- **Priority Levels** - High, Medium, Low priorities
- **Due Dates** - Set and track deadlines
- **Tags** - Organize tasks with custom tags

### Task Sharing
- **Share with Users** - Invite team members by email
- **Permission Levels** - Read-only or read-write access
- **Shared Task List** - View tasks shared with you

### Search & Filters
- **Text Search** - Search by title and description
- **Status Filter** - Filter by task status
- **Priority Filter** - Filter by priority level
- **Overdue Filter** - Show only overdue tasks
- **Clear Filters** - Reset all filters

### Real-time Features
- **Live Updates** - Tasks update in real-time
- **Connection Status** - Visual indicator of socket connection
- **Collaborative Editing** - Multiple users can work simultaneously

## 🎨 Styling

The app uses **Tailwind CSS v4** with a custom color scheme:

- **Primary Colors** - Blue theme for main actions
- **Success Colors** - Green for completed tasks
- **Warning Colors** - Yellow for in-progress tasks
- **Danger Colors** - Red for overdue and high priority tasks

### Custom CSS Classes

The app includes custom utility classes in `src/index.css`:

```css
/* Button styles */
.btn-primary, .btn-secondary, .btn-danger

/* Badge styles */
.badge, .badge-success, .badge-warning, .badge-danger, .badge-info

/* Card styles */
.card

/* Input styles */
.input, .input-sm

/* Loading spinner */
.loading-spinner
```

## 🔌 API Integration

The frontend communicates with the backend API at `http://localhost:5000`:

### Authentication Endpoints
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Task Endpoints
- `GET /api/tasks` - Get tasks with filters
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/share` - Share task
- `GET /api/tasks/stats` - Get task statistics

### User Endpoints
- `PUT /api/users/profile` - Update user profile

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

## 📦 Building for Production

Build the app for production:

```bash
npm run build
```

The build files will be created in the `build/` directory.

## 🚀 Deployment

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the backend README for API documentation
- Review the component structure for implementation details
- Ensure all dependencies are properly installed
- Verify Google OAuth configuration

## 🔄 Updates

This frontend has been completely rewritten in **JSX format** for better maintainability and modern React practices. All components now use proper JSX syntax and follow React 19 best practices.
