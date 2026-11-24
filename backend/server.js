const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const jobRoutes = require('./routes/job.routes');
const { errorHandler } = require('./middleware/error.middleware');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'CareerTrack Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/jobs', jobRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`🚀 CareerTrack API Server is running on http://localhost:${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👉 Job endpoints: http://localhost:${PORT}/api/jobs`);
  });
}

app.server = server;
module.exports = app;
