import { db } from '../db/index.js';
import { feedback } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Submit feedback
 */
export async function submitFeedbackController(req, res) {
  try {
    const { poll_id, feedback_text } = req.body;

    console.log('Received feedback submission:', {
      poll_id,
      feedback_text,
    });

    if (!poll_id || !feedback_text) {
      return res.status(400).json({
        success: false,
        message: 'poll_id and feedback_text are required',
      });
    }

    const [newFeedback] = await db
      .insert(feedback)
      .values({
         pollId: poll_id,
         feedbackText: feedback_text,
      })
      .returning();

    return res.status(201).json({
      success: true,
      feedback: newFeedback,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
}

/**
 * Get feedback for a poll
 */
export async function getFeedbackController(req, res) {
  try {
    const { poll_id } = req.params;

    const feedbackList = await db
      .select()
      .from(feedback)
      .where(eq(feedback.pollId, poll_id))
      .orderBy(feedback.createdAt);

    return res.json({
      success: true,
      feedback: feedbackList,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message,
    });
  }
}
