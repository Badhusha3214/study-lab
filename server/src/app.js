import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import transcriptRoutes from './routes/transcriptRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// CORS configuration - allow requests from React app
// Relaxed CORS: reflect request origin and handle preflight
app.use(cors({ 
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
// Explicitly respond to preflight across routes
app.options('*', cors());

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/transcript', transcriptRoutes);
app.use('/api/content', contentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});
app.use(errorHandler);

export default app;
