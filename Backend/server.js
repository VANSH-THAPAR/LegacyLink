const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/connectDB'); // Assuming you have this file

// --- Environment Variable Check ---
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error('FATAL ERROR: MONGO_URI and JWT_SECRET must be defined.');
    process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
// Use cors before defining routes
app.use(cors()); 
// Increase limit for base64 image uploads
app.use(express.json({ limit: '10mb' })); 

// --- API Routes ---
// These prefixes correctly create /api/auth/* and /api/user/* routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/student', require('./routes/student'));
app.use('/api/events', require('./routes/events'));
app.use('/api/messages', require('./routes/messages'));

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));