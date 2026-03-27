const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));

// Socket.io for real-time notifications
global.io = io;
const connectedUsers = new Map();
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) connectedUsers.set(userId, socket.id);
  socket.on('disconnect', () => {
    for (const [uid, sid] of connectedUsers.entries()) {
      if (sid === socket.id) { connectedUsers.delete(uid); break; }
    }
  });
});
global.connectedUsers = connectedUsers;

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
