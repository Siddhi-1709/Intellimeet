const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// File-based database (no MongoDB needed)
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Helper functions
const readUsers = () => {
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const JWT_SECRET = 'intellimeet_secret_key_2024';

// ============= AUTH ROUTES =============

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Register request:', req.body);
  
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const users = readUsers();
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered:', email);
    
    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login request:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const users = readUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// VERIFY TOKEN
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// GET all users (for testing)
app.get('/api/users', (req, res) => {
  const users = readUsers();
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email })));
});

// ============= SOCKET.IO FOR MEETINGS =============
const meetings = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('create-meeting', ({ meetingId, hostName }) => {
    socket.join(meetingId);
    meetings.set(meetingId, {
      hostId: socket.id,
      hostName: hostName,
      participants: []
    });
    socket.meetingId = meetingId;
    socket.userName = hostName;
    socket.isHost = true;
    
    console.log(`📹 Meeting created: ${meetingId} by ${hostName}`);
    socket.emit('meeting-created', { success: true, meetingId });
  });

  socket.on('join-meeting', ({ meetingId, userName }) => {
    const meeting = meetings.get(meetingId);
    
    if (!meeting) {
      socket.emit('join-error', { message: 'Meeting not found' });
      return;
    }
    
    socket.join(meetingId);
    socket.meetingId = meetingId;
    socket.userName = userName;
    socket.isHost = false;
    
    meeting.participants.push({
      id: socket.id,
      name: userName
    });
    
    socket.to(meetingId).emit('user-joined', {
      id: socket.id,
      name: userName
    });
    
    const allParticipants = meeting.participants.map(p => ({
      id: p.id,
      name: p.name
    }));
    
    socket.emit('current-participants', {
      participants: allParticipants,
      hostName: meeting.hostName
    });
    
    console.log(`👤 ${userName} joined meeting ${meetingId}`);
  });

  socket.on('leave-meeting', () => {
    if (socket.meetingId) {
      const meeting = meetings.get(socket.meetingId);
      if (meeting) {
        meeting.participants = meeting.participants.filter(p => p.id !== socket.id);
        socket.to(socket.meetingId).emit('user-left', {
          id: socket.id,
          name: socket.userName
        });
        
        if (socket.isHost) {
          io.to(socket.meetingId).emit('meeting-ended');
          meetings.delete(socket.meetingId);
          console.log(`📹 Meeting ended: ${socket.meetingId}`);
        }
      }
      socket.leave(socket.meetingId);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    if (socket.meetingId) {
      const meeting = meetings.get(socket.meetingId);
      if (meeting) {
        meeting.participants = meeting.participants.filter(p => p.id !== socket.id);
        socket.to(socket.meetingId).emit('user-left', {
          id: socket.id,
          name: socket.userName
        });
        
        if (socket.isHost) {
          io.to(socket.meetingId).emit('meeting-ended');
          meetings.delete(socket.meetingId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ File-based storage ready (no MongoDB needed)`);
  console.log(`✅ Socket.IO ready for meetings`);
  console.log(`========================================\n`);
});