# Real-Time Chat Application

A full-stack real-time 1:1 chat application built with React Native (Expo) and Node.js.

## Features

- User authentication (Register/Login with JWT)
- Real-time messaging with Socket.IO
- Typing indicators
- Online/offline status
- Message delivery and read receipts (tick marks)
- Clean and intuitive UI
- Persistent message storage
- **Cross-platform**: Web, iOS, and Android

## Tech Stack

### Backend
- Node.js
- Express.js
- Socket.IO
- **MongoDB Atlas (Cloud Database)**
- JWT Authentication
- bcryptjs

### Frontend
- **React Native with Expo SDK 54**
- React Navigation
- Socket.IO Client
- Axios
- AsyncStorage
- **Runs on Web, iOS & Android**

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
└── mobile/                # Expo React Native application
    ├── src/
    │   ├── config/        # API configuration
    │   ├── context/       # React context (Auth)
    │   ├── screens/       # App screens
    │   ├── services/      # API & Socket services
    │   └── App.js         # App entry point
    ├── app.json           # Expo configuration
    ├── package.json
    └── App.js             # Expo entry point

```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- **MongoDB Atlas account** (free tier available at https://www.mongodb.com/cloud/atlas)
- **For Mobile**: Expo Go app on your phone (optional, for easy testing)
- **No Xcode or Android Studio required!** ✨

### Backend Setup

1. **Set up MongoDB Atlas:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account and cluster
   - Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - **Important**: Whitelist your IP or allow access from anywhere (0.0.0.0/0) in Network Access

2. Navigate to the server directory:
```bash
cd server
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Update `.env` with your MongoDB Atlas connection:
```env
PORT=3000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

6. Start the server:
```bash
npm run dev
```

You should see:
```
MongoDB connected successfully
Server running on port 3000
```

### Frontend Setup (Expo)

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
// For Web (localhost works)
export const API_URL = 'http://localhost:3000';
export const SOCKET_URL = 'http://localhost:3000';

// For Mobile devices (Expo Go)
// Replace with your computer's IP address
export const API_URL = 'http://192.168.x.x:3000';
export const SOCKET_URL = 'http://192.168.x.x:3000';
```

**To find your IP address:**
- **Mac/Linux**: `ifconfig | grep "inet "`
- **Windows**: `ipconfig`

4. Run the app:

**For Web (easiest):**
```bash
npx expo start --web
```
Opens in your browser at http://localhost:8082

**For iOS/Android (Expo Go app):**
```bash
npx expo start
```
Then:
- Install "Expo Go" app from App Store (iOS) or Play Store (Android)
- Scan the QR code with your phone
- App loads instantly! No Xcode/Android Studio needed ✨

**Testing with 2 users on Web:**
- Open browser: http://localhost:8082
- Register User 1 (e.g., alice@test.com)
- Open **incognito/private window**: http://localhost:8082
- Register User 2 (e.g., bob@test.com)
- Start chatting in real-time!

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

You can create test users by registering through the app. Here are sample test accounts:

**User 1:**
- Username: suman
- Email: sumansinha437@gmail.com
- Password: suman1729

**User 2:**
- Username: sinha
- Email: sinhasuman437@gmail.com
- Password: sinha1729

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

### MongoDB Atlas Connection Issues
- Check your connection string in `server/.env`
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Verify username/password are correct
- Check if cluster is active (not paused)

### Expo Connection Issues
- **Web**: Make sure backend is running on port 3000
- **Mobile**:
  - Don't use `localhost` - use your computer's actual IP address
  - Ensure phone and computer are on the same WiFi network
  - Check firewall allows connections on port 3000
- **General**: Clear cache with `npx expo start --clear`

### Socket Connection Issues
- Check that Socket.IO server is running
- Look for "Socket connected" message in console
- Verify authentication token is valid
- Check browser console (F12) for errors

## Development

To run the development environment:

1. **Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

2. **Terminal 2 - Frontend:**
```bash
cd mobile
npx expo start --web
# Or: npx expo start (for mobile)
```

3. **Test:**
- Web: Open http://localhost:8082
- Mobile: Scan QR code with Expo Go app

## Production Deployment

### Backend
1. Use environment variables for sensitive data
2. Enable CORS only for your frontend domain
3. **MongoDB Atlas** already configured (production-ready!)
4. Enable SSL/HTTPS
5. Deploy to services like Heroku, Railway, AWS, or DigitalOcean

### Frontend (Expo)
1. Update API URLs in `src/config/api.js` to production backend
2. **For Web**: Run `npx expo export:web` and deploy to Vercel/Netlify
3. **For Mobile Apps**:
   - Install EAS CLI: `npm install -g eas-cli`
   - Build: `eas build --platform ios` or `eas build --platform android`
   - Submit to stores: `eas submit`
   - Or use Expo's OTA updates for instant deployment

**Expo makes deployment much easier than traditional React Native!**

## License

MIT

## Author
suman sinha
Built for the Chat App Assignment
Deadline: 10th November 2025
