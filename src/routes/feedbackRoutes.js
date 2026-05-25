import express from 'express';
import {submitFeedbackController,getFeedbackController,} from '../controllers/feedbackController.js';

export function createFeedbackRoutes() {
  const router = express.Router();

  // Submit feedback
  router.post('/', submitFeedbackController);

  return router;
}
