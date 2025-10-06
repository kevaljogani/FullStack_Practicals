# CampusConnect - Student Collaboration Platform

CampusConnect is a comprehensive web application designed for college students to connect, collaborate on events, share academic resources, and participate in discussions. Built with modern web technologies including React.js frontend and Node.js/Express.js backend with MongoDB database.

## 🚀 Features

### Authentication & User Management
- **JWT-based Authentication** - Secure login/signup system
- **Role-based Access Control** - Student and Admin roles
- **Profile Management** - Update personal information, profile picture
- **Password Management** - Secure password change functionality

### Event Management
- **Create & Manage Events** - Students and admins can create events
- **Event Categories** - Academic, Sports, Cultural, Technical, etc.
- **Join/Leave Events** - RSVP functionality with participant limits
- **Event Discovery** - Search and filter events by category, date, location
- **Admin Approval** - Optional approval workflow for events

### Discussion Forum
- **Categorized Discussions** - Topics like General, Academics, Tech, Sports
- **Real-time Features** - Live messaging with Socket.io
- **Interactive Posts** - Like, reply, and comment on posts
- **Moderation Tools** - Admin can pin, lock, approve posts
- **Rich Content** - Support for attachments and media

### Resource Sharing
- **File Upload System** - Share notes, assignments, past papers
- **Categorized Resources** - Organized by subject, department, semester
- **Rating System** - Students can rate and review resources
- **Admin Approval** - Quality control through approval workflow
- **Download Tracking** - Monitor resource usage and popularity

### Notifications System
- **Real-time Notifications** - Instant updates for events, replies, approvals
- **Email Integration** - Optional email notifications
- **Notification Center** - Centralized notification management
- **Broadcast Messages** - Admin can send announcements to all users

### Additional Features
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Search Functionality** - Global search across events, posts, and resources
- **File Management** - Secure file upload with type validation
- **Dashboard Analytics** - Overview of platform activity
- **Socket.io Integration** - Real-time chat and notifications

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern frontend framework
- **Material-UI (MUI)** - Comprehensive component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Query** - Data fetching and caching
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **React Hot Toast** - User notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Socket.io** - Real-time bidirectional communication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (v4.0.0 or higher)
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "SEM 5/FSWD/Mini Project"
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd campusconnect-backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file with the following configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusconnect
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_complex
JWT_EXPIRE=7d

# Email Configuration (Optional)
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

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../campusconnect-frontend
```

Install dependencies:
```bash
npm install
```

### 4. Database Setup

Start MongoDB service:
- **Windows**: Start MongoDB service from Services or run `mongod`
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

The application will automatically create the database and collections when you first run it.

## 🏃‍♂️ Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd campusconnect-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd campusconnect-frontend
npm start
```

### Option 2: Run Both Concurrently (Recommended)

From the backend directory:
```bash
npm run dev
```

From the frontend directory:
```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 👤 Default User Accounts

After starting the application, you can create new accounts through the registration page. The first user registered can be promoted to admin status through the database directly, or you can create admin accounts programmatically.

### Creating Admin User (Optional)
You can create an admin user by registering normally and then updating the user role in MongoDB:

```javascript
// Connect to MongoDB and run this query
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 📁 Project Structure

```
Mini Project/
├── campusconnect-backend/          # Backend application
│   ├── models/                     # Database models
│   ├── routes/                     # API routes
│   ├── middleware/                 # Custom middleware
│   ├── uploads/                    # File upload directory
│   ├── server.js                   # Main server file
│   └── package.json               # Backend dependencies
│
├── campusconnect-frontend/         # Frontend application
│   ├── public/                     # Public assets
│   ├── src/                        # Source code
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # Page components
│   │   ├── contexts/               # React contexts
│   │   ├── App.js                  # Main App component
│   │   └── index.js                # Entry point
│   └── package.json               # Frontend dependencies
│
└── README.md                       # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join event
- `POST /api/events/:id/leave` - Leave event

### Forum
- `GET /api/forum` - Get all forum posts
- `POST /api/forum` - Create new post
- `GET /api/forum/:id` - Get post by ID
- `PUT /api/forum/:id` - Update post
- `DELETE /api/forum/:id` - Delete post
- `POST /api/forum/:id/reply` - Add reply
- `POST /api/forum/:id/like` - Like/unlike post

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Upload new resource
- `GET /api/resources/:id` - Get resource by ID
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `POST /api/resources/:id/download` - Download resource
- `POST /api/resources/:id/rate` - Rate resource

## 🎨 Features Demo

### 1. User Registration & Authentication
- Navigate to http://localhost:3000/register
- Fill in your details (name, email, password, department, etc.)
- Login with your credentials

### 2. Create and Join Events
- Go to Events section
- Click "Create Event" to add a new event
- Browse and join existing events
- View event details and participant lists

### 3. Forum Discussions
- Visit the Forum section
- Create new discussion posts
- Reply to existing posts
- Like and interact with content

### 4. Resource Sharing
- Upload academic resources (notes, assignments)
- Browse resources by category and subject
- Download and rate resources
- Bookmark useful resources

### 5. Admin Features (Admin users only)
- Approve pending events and resources
- Manage users and content
- Send broadcast notifications
- View platform statistics

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt
- **Input Validation** and sanitization
- **File Upload Security** with type and size restrictions
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Security Headers** with Helmet.js

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:
1. Check the console logs for error messages
2. Ensure MongoDB is running
3. Verify environment variables are set correctly
4. Check network connectivity
5. Review the API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- MongoDB for the flexible database solution
- Socket.io for real-time communication
- All the amazing open-source libraries that made this project possible

---

**Happy Coding! 🚀**
