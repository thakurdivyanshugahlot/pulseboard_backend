import express from 'express';
import {
  createPollController,
  getPollController,
  closePollController,
  resetPollController,
  getUserPollsController,
} from '../controllers/pollController.js';
import { getFeedbackController } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/authMiddleware.js';

export function createPollRoutes(io) {
  const router = express.Router();

  // Create poll
  router.post('/create',authenticate ,(req, res) => createPollController(req, res, io));

  // Get poll
  router.get('/:id', getPollController);

  // Get feedback for poll
  router.get('/:poll_id/feedback', getFeedbackController);

  // Get user polls
  router.get('/user/me', authenticate, getUserPollsController);

  // Close poll
  router.post('/:id/close', authenticate, (req, res) => closePollController(req, res, io));

  // Reset poll
  router.post('/:id/reset', authenticate, (req, res) => resetPollController(req, res, io));

  return router;
}
