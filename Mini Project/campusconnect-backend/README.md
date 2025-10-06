# CampusConnect Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusconnect
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_complex
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
CLIENT_URL=http://localhost:3000
```

3. Start MongoDB service

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/change-password` - Change password
- POST `/api/auth/logout` - Logout user

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- POST `/api/users/profile-picture` - Upload profile picture
- GET `/api/users` - Get all users (admin)
- GET `/api/users/search` - Search users
- GET `/api/users/:id` - Get user by ID

### Events
- GET `/api/events` - Get all events
- GET `/api/events/:id` - Get event by ID
- POST `/api/events` - Create new event
- PUT `/api/events/:id` - Update event
- POST `/api/events/:id/join` - Join event
- POST `/api/events/:id/leave` - Leave event
- PUT `/api/events/:id/approve` - Approve event (admin)
- DELETE `/api/events/:id` - Delete event

### Forum
- GET `/api/forum` - Get all forum posts
- GET `/api/forum/:id` - Get forum post by ID
- POST `/api/forum` - Create new post
- PUT `/api/forum/:id` - Update post
- POST `/api/forum/:id/reply` - Add reply
- POST `/api/forum/:id/like` - Like/unlike post
- PUT `/api/forum/:id/pin` - Pin/unpin post (admin)
- PUT `/api/forum/:id/lock` - Lock/unlock post (admin)
- DELETE `/api/forum/:id` - Delete post

### Resources
- GET `/api/resources` - Get all resources
- GET `/api/resources/:id` - Get resource by ID
- POST `/api/resources` - Upload new resource
- PUT `/api/resources/:id` - Update resource
- POST `/api/resources/:id/download` - Download resource
- POST `/api/resources/:id/bookmark` - Bookmark resource
- POST `/api/resources/:id/rate` - Rate resource
- PUT `/api/resources/:id/approve` - Approve resource (admin)
- DELETE `/api/resources/:id` - Delete resource

### Notifications
- GET `/api/notifications` - Get user notifications
- PUT `/api/notifications/:id/read` - Mark notification as read
- PUT `/api/notifications/read-all` - Mark all as read
- DELETE `/api/notifications/:id` - Delete notification
- POST `/api/notifications/broadcast` - Broadcast notification (admin)

## Features

- JWT Authentication
- Role-based access control (Student/Admin)
- File upload with validation
- Real-time chat with Socket.io
- Email notifications
- Input validation and sanitization
- Rate limiting and security headers
- MongoDB with Mongoose ODM
- RESTful API design
