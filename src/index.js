import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import serviceRoutes from './routes/services.js';
import paymentRoutes from './routes/payment.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import emailRoutes from './routes/email.js';
import whatsappRoutes from './routes/whatsapp.js';
import cookieParser from 'cookie-parser';
import professionalRoutes from './routes/professional.js';

dotenv.config();

const app = express();

// Middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    // Log all CORS-related information
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', [
      'https://servio-try2.vercel.app',
      process.env.CLIENT_URL
    ]);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    const allowedOrigins = [
      'https://servio-try2.vercel.app',
      process.env.CLIENT_URL,
      'http://localhost:3000' // Add localhost for development
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing request from origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS: Blocking request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
// app.use(cors({
//   origin: function(origin, callback) {
//     const allowedOrigins = [
//       'https://servio-try2.vercel.app',
//       process.env.CLIENT_URL
//     ].filter(Boolean); // Remove any undefined/null values
    
//     console.log('Request origin:', origin);
//     console.log('Allowed origins:', allowedOrigins);
    
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log('CORS blocked for origin:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-Requested-With',
//     'Accept',
//     'Origin'
//   ],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   maxAge: 600, // Cache preflight requests for 10 minutes
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));
// app.use(cors({
//   origin: function(origin, callback) {
//     const allowedOrigins = [
//       'https://servio-try2.vercel.app',process.env.CLIENT_URL,
      
//     ];
    
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);  
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/professionals', professionalRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/servio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('Connected to MongoDB');
  // Store the MongoDB connection in app.locals
  app.locals.db = mongoose.connection;
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error in error handling middleware:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request headers:', req.headers);
  
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 