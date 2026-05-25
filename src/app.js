import express from 'express';
import cors from 'cors';
import { createPollRoutes } from './routes/pollRoutes.js';
import { createVoteRoutes } from './routes/voteRoutes.js';
import { createFeedbackRoutes } from './routes/feedbackRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { config } from './config/db.js';
import { createAuthRoutes } from './routes/authRoutes.js';
export function createApp(io) {
  const app = express();

  // Middleware
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/polls', createPollRoutes(io));
  app.use('/api/votes', createVoteRoutes(io));
  app.use('/api/feedback', createFeedbackRoutes());
  app.use('/api/auth',createAuthRoutes());

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}
