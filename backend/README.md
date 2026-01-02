# WorkDesks Support - Backend API

Backend API for the WorkDesks Support Ticket System built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Multi-role user system (Super Admin, Admin, Manager, Agent, Customer)
- **Ticket Management**: Complete CRUD operations for support tickets
- **RESTful API**: Clean and organized API endpoints
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing with bcrypt, JWT tokens

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/workdesk-support
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8080
```

## 🚀 Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── ticket.controller.js # Ticket operations
│   │   └── user.controller.js   # User management
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT verification & authorization
│   ├── models/
│   │   ├── User.model.js        # User schema
│   │   └── Ticket.model.js      # Ticket schema
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── ticket.routes.js     # Ticket endpoints
│   │   └── user.routes.js       # User endpoints
│   └── server.js                # App entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Tickets
- `GET /api/tickets` - Get all tickets (Protected)
- `GET /api/tickets/:id` - Get single ticket (Protected)
- `POST /api/tickets` - Create ticket (Protected)
- `PUT /api/tickets/:id` - Update ticket (Protected)
- `DELETE /api/tickets/:id` - Delete ticket (Protected)

### Users
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get single user (Protected)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check
- `GET /api/health` - Server health status

## 🔐 User Roles

- **super_admin**: Full system access
- **admin**: Administrative access
- **manager**: Team and ticket management
- **agent**: Assigned ticket management
- **customer**: Own ticket management

## 🧪 Testing the API

You can test the API using:
- **Postman** or **Insomnia**
- **cURL** commands
- Frontend application

### Example: Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@workdesks.com","password":"super123"}'
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/workdesk-support |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:8080 |

## 🔧 Development

### Install nodemon for auto-reload:
```bash
npm install -D nodemon
```

### Run in development mode:
```bash
npm run dev
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **express-validator**: Request validation
- **morgan**: HTTP request logger

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC
