import { db } from '../db/index.js';

import {
  polls,
  pollOptions,
} from '../db/schema.js';

import {eq,and,sql} from 'drizzle-orm';

// Submit a vote

export async function submitVoteController(
  req,
  res,
  io
) {
  try {
    const {
      poll_id,
      option_ids,
    } = req.body;

    /**
     * Validation
     */
    if (
      !poll_id ||
      !Array.isArray(option_ids) ||
      option_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'poll_id and option_ids are required',
      });
    }

    /**
     * Fetch poll
     */
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, poll_id));

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found',
      });
    }

    /**
     * Expiration check
     */
    const isExpired =
      poll.expiresAt &&
      new Date(poll.expiresAt) <
        new Date();

    if (
      poll.isClosed ||
      isExpired
    ) {
      return res.status(400).json({
        success: false,
        message: isExpired
          ? 'Poll has expired'
          : 'Poll is closed',
      });
    }

    /**
     * Prevent multiple selections
     * on single-select polls
     */
    if (
      !poll.allowMultiple &&
      option_ids.length > 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Only one option allowed for this poll',
      });
    }

    /**
     * Increment votes
     */
    for (const optionId of option_ids) {

      const [option] = await db
        .select()
        .from(pollOptions)
        .where(
          and(
            eq(
              pollOptions.id,
              optionId
            ),
            eq(
              pollOptions.pollId,
              poll_id
            )
          )
        );

      if (!option) {
        continue;
      }

      await db
        .update(pollOptions)
        .set({
          voteCount: sql`${pollOptions.voteCount} + 1`,
        })
        .where(
          eq(
            pollOptions.id,
            optionId
          )
        );
    }

    /**
     * Fetch updated options
     */
    const options = await db
      .select()
      .from(pollOptions)
      .where(
        eq(
          pollOptions.pollId,
          poll_id
        )
      );

    // Use centralized broadcast helper
    const { broadcastVoteUpdate } = await import('../sockets/socketHandler.js');
    broadcastVoteUpdate(io, poll_id, options);

    return res.status(200).json({
      success: true,
      options,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Failed to submit vote',
    });
  }
}