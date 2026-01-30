const express = require('express');
const cors = require('cors');
const http = require('http'); // Import http module
const socketIo = require('socket.io'); // Import socket.io
require('dotenv').config();
const connectDB = require('./db/connectDB');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for dev, restrict in prod
        methods: ["GET", "POST"]
    }
});

// Make io available in routes
app.set('io', io);

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Removed overly verbose performance middleware to reduce log noise as requested

// --- WebSocket Logic ---
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a private room based on userId (sent from client)
    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        }
    });

    // Handle sending messages (Real-time relay)
    socket.on('send_message', (data) => {
        // data should contain { recipientId, message, senderName ... }
        // Emit to the specific recipient's room
        if (data.recipientId) {
            io.to(data.recipientId).emit('receive_message', data);
            // Also emit back to sender so they see it confirmed (optional if they update UI optimistically)
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/alumni', require('./routes/alumniRoutes'));
app.use('/api/student', require('./routes/student'));
app.use('/api/student-management', require('./routes/student-management'));
app.use('/api/events', require('./routes/events'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/university', require('./routes/university'));
app.use('/api/', require('./routes/dashboardRoutes')); // Kept for legacy compatibility

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
// Use strict http server listen
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
