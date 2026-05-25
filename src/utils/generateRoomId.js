/**
 * Generate a unique room ID for polls
 */
export function generateRoomId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Validate poll data
 */
export function validatePollData(question, options) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return { valid: false, error: 'Question is required and must be a string' };
  }

  if (!Array.isArray(options) || options.length < 2) {
    return { valid: false, error: 'At least 2 options are required' };
  }

  const invalidOptions = options.filter(
    opt => typeof opt !== 'string' || opt.trim().length === 0
  );

  if (invalidOptions.length > 0) {
    return { valid: false, error: 'All options must be non-empty strings' };
  }

  return { valid: true };
}

/**
 * Format poll response
 */
export function formatPollResponse(poll) {
  return {
    id: poll.id,
    question: poll.question,
    is_closed: poll.is_closed,
    allow_multiple: poll.allow_multiple,
    options: poll.options || [],
    created_at: poll.created_at,
    expires_at: poll.expires_at,
  };
}
