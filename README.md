# Real-Time Chat Application

A full-stack real-time 1:1 chat application built with React Native and Node.js.

## Features

- User authentication (Register/Login with JWT)
- Real-time messaging with Socket.IO
- Typing indicators
- Online/offline status
- Message delivery and read receipts (tick marks)
- Clean and intuitive UI
- Persistent message storage

## Tech Stack

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

### Frontend
- React Native
- React Navigation
- Socket.IO Client
- Axios
- AsyncStorage

## Project Structure

```
.
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── socket/        # Socket.IO handlers
│   │   └── index.js       # Server entry point
│   ├── package.json
│   └── .env.example
│
└── mobile/                # React Native application
    ├── src/
    │   ├── config/        # API configuration
    │   ├── context/       # React context (Auth)
    │   ├── screens/       # App screens
    │   ├── services/      # API & Socket services
    │   └── App.js         # App entry point
    ├── package.json
    └── index.js

```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- React Native development environment
- Xcode (for iOS) or Android Studio (for Android)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

5. Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod
```

6. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/config/api.js`:
```javascript
// For iOS Simulator
export const API_URL = 'http://localhost:3000';
export const SOCKET_URL = 'http://localhost:3000';

// For Android Emulator
export const API_URL = 'http://10.0.2.2:3000';
export const SOCKET_URL = 'http://10.0.2.2:3000';

// For Physical Device (use your computer's IP)
export const API_URL = 'http://192.168.x.x:3000';
export const SOCKET_URL = 'http://192.168.x.x:3000';
```

4. Install iOS dependencies (Mac only):
```bash
cd ios && pod install && cd ..
```

5. Run the app:

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Users
- `GET /users` - Get all users
- `GET /users/me` - Get current user
- `GET /users/:id` - Get user by ID

### Conversations
- `GET /conversations` - Get all user conversations
- `POST /conversations` - Create or get conversation
- `GET /conversations/:id/messages` - Get conversation messages

## Socket Events

### Client → Server
- `message:send` - Send new message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:delivered` - Mark message as delivered
- `message:read` - Mark message as read

### Server → Client
- `message:new` - Receive new message
- `message:delivered` - Message delivered confirmation
- `message:read` - Message read confirmation
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

## Sample Users for Testing

You can create test users by registering through the app, or use these sample credentials if you seed your database:

**User 1:**
- Username: alice
- Email: alice@test.com
- Password: password123

**User 2:**
- Username: bob
- Email: bob@test.com
- Password: password123

## Features Breakdown

### 1. Authentication
- JWT-based authentication
- Secure password hashing with bcryptjs
- Token stored in AsyncStorage
- Auto-login on app restart

### 2. Real-time Messaging
- Instant message delivery using Socket.IO
- Message persistence in MongoDB
- Offline message queue

### 3. Typing Indicators
- Real-time typing status
- Auto-hide after 2 seconds of inactivity

### 4. Online Status
- Live online/offline indicators
- Last seen timestamp
- Automatic status updates

### 5. Read Receipts
- Single tick: Message sent
- Double tick (gray): Message delivered
- Double tick (blue): Message read

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### React Native Connection Issues
- Make sure backend server is running
- Check API URLs in `src/config/api.js`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use your computer's local IP address
- Ensure firewall allows connections on port 3000

### Socket Connection Issues
- Check that Socket.IO server is running
- Verify CORS settings in backend
- Check console for connection errors
- Ensure authentication token is valid

## Development

To run the development environment:

1. Start MongoDB
2. Start backend: `cd server && npm run dev`
3. Start React Native Metro: `cd mobile && npm start`
4. Run iOS/Android app

## Production Deployment

### Backend
1. Use environment variables for sensitive data
2. Enable CORS only for your frontend domain
3. Use a production MongoDB instance (MongoDB Atlas)
4. Enable SSL/HTTPS
5. Deploy to services like Heroku, AWS, or DigitalOcean

### Frontend
1. Update API URLs to production backend
2. Build release APK/IPA
3. Follow React Native deployment guides for App Store/Play Store

## License

MIT

## Author

Built for the Chat App Assignment
Deadline: 10th November 2025
