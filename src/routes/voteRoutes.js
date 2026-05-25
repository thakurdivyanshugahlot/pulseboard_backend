import express from 'express';
import { submitVoteController } from '../controllers/voteController.js';

export function createVoteRoutes(io) {
  const router = express.Router();

  // Submit vote
  router.post('/', (req, res) => submitVoteController(req, res, io));

  return router;
}
