import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import {
  polls,
  pollOptions,
} from '../db/schema.js';

import { eq } from 'drizzle-orm';
import { broadcastPollCreated, broadcastPollClosed, broadcastPollReset } from '../sockets/socketHandler.js';

/**
 * Helper:
 * derive poll state
 */
function buildPollState(poll) {
  const isExpired =
    poll.expiresAt &&
    new Date(poll.expiresAt) < new Date();

  const isVotingClosed =
    poll.isClosed || isExpired;

  return {
    ...poll,
    isExpired,
    isVotingClosed,
  };
}

/**
 * Create poll
 */
export async function createPollController(
  req,
  res,
  io
) {
  try {
    const {
      question,
      options,
      allow_multiple,
      expires_at,
    } = req.body;

    console.log('Poll creation request:', {
      question,
      optionsCount: options?.length,
      userId: req.user?.id
    });

    /**
     * Validation
     */
    if (
      !question ||
      !Array.isArray(options) ||
      options.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Question and at least 2 options are required',
      });
    }

    const validOptions = options.every(
      option =>
        typeof option === 'string' &&
        option.trim() !== ''
    );

    if (!validOptions) {
      return res.status(400).json({
        success: false,
        message:
          'Options must be non-empty strings',
      });
    }

    /**
     * Validate expiry
     */
    let formattedExpiry = null;

    if (expires_at) {
      formattedExpiry = new Date(expires_at);

      if (
        isNaN(formattedExpiry.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid expires_at date',
        });
      }
    }

    /**
     * Create poll
     */
    const pollId = uuidv4();
    const [poll] = await db
      .insert(polls)
      .values({
        id: pollId,
        question,
        creatorId: req.user.id,
        allowMultiple:
          allow_multiple || false,
        expiresAt: formattedExpiry,
      })
      .returning();

    if (!poll) {
      throw new Error('Failed to create poll record');
    }

    /**
     * Create options
     */
    const optionsData = options.map(
      optionText => ({
        id: uuidv4(),
        pollId: poll.id,
        optionText: optionText.trim(),
      })
    );

    const createdOptions = await db
      .insert(pollOptions)
      .values(optionsData)
      .returning();

    if (!createdOptions || createdOptions.length === 0) {
      throw new Error('Failed to create poll options');
    }

    /**
     * Build response
     */
    const pollData = buildPollState({
      ...poll,
      options: createdOptions,
    });

    /**
     * Emit realtime event
     */
    broadcastPollCreated(io, pollData);

    return res.status(201).json({
      success: true,
      poll: pollData,
    });

  } catch (error) {
    console.error(
      'Error creating poll:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to create poll',
      error: error.message,
    });
  }
}

/**
 * Get poll
 */
export async function getPollController(
  req,
  res
) {
  try {
    const { id } = req.params;

    /**
     * Fetch poll
     */
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, id));

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found',
      });
    }

    /**
     * Fetch options
     */
    const options = await db
      .select()
      .from(pollOptions)
      .where(eq(pollOptions.pollId, id));

    /**
     * Build response
     */
    const pollData = buildPollState({
      ...poll,
      options,
    });

    return res.status(200).json({
      success: true,
      poll: pollData,
    });

  } catch (error) {
    console.error(
      'Error fetching poll:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch poll',
      error: error.message,
    });
  }
}

/**
 * Close poll manually
 */
export async function closePollController(
  req,
  res,
  io
) {
  try {
    const { id } = req.params;

    // Fetch poll to check ownership
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, id));

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found',
      });
    }

    if (poll.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the creator of this poll',
      });
    }

    const [updatedPoll] = await db
      .update(polls)
      .set({
        isClosed: true,
      })
      .where(eq(polls.id, id))
      .returning();

    /**
     * Emit realtime event
     */
    broadcastPollClosed(io, id);

    return res.status(200).json({
      success: true,
      poll: buildPollState(
        updatedPoll
      ),
    });

  } catch (error) {
    console.error(
      'Error closing poll:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to close poll',
      error: error.message,
    });
  }
}

/**
 * Reset poll votes
 */
export async function resetPollController(
  req,
  res,
  io
) {
  try {
    const { id } = req.params;

    // Fetch poll to check ownership
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, id));

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found',
      });
    }

    if (poll.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the creator of this poll',
      });
    }

    /**
     * Reset votes
     */
    await db
      .update(pollOptions)
      .set({
        voteCount: 0,
      })
      .where(eq(pollOptions.pollId, id));

    /**
     * Fetch updated options
     */
    const options = await db
      .select()
      .from(pollOptions)
      .where(eq(pollOptions.pollId, id));

    /**
     * Emit realtime event
     */
    broadcastPollReset(io, id, options);

    return res.status(200).json({
      success: true,
      message:
        'Poll votes reset',
      options,
    });

  } catch (error) {
    console.error(
      'Error resetting poll:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to reset poll',
      error: error.message,
    });
  }
}

/**
 * Get polls by user
 */
export async function getUserPollsController(
  req,
  res
) {
  try {
    const userId = req.user.id;

    const userPolls = await db
      .select()
      .from(polls)
      .where(eq(polls.creatorId, userId))
      .orderBy(polls.createdAt);

    // Fetch total votes for each poll
    const pollsWithVotes = await Promise.all(
      userPolls.map(async (poll) => {
        const options = await db
          .select()
          .from(pollOptions)
          .where(eq(pollOptions.pollId, poll.id));
        
        const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0);
        
        return {
          ...poll,
          totalVotes,
        };
      })
    );

    return res.status(200).json({
      success: true,
      polls: pollsWithVotes,
    });

  } catch (error) {
    console.error(
      'Error fetching user polls:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch your polls',
      error: error.message,
    });
  }
}