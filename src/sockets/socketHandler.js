import { db } from '../db/index.js';
import { polls } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Socket.io event handlers
 */
export function handleSocketConnection(socket, io) {
  console.log(`✓ Client connected: ${socket.id}`);

  // Join poll room
  socket.on('join-poll', async (data) => {
    try {
      const { poll_id } = typeof data === 'string' ? { poll_id: data } : data;

      if (!poll_id) {
        return socket.emit('error', { message: 'poll_id is required' });
      }

      // Production Tip: Validate if poll exists before joining room
      // to prevent "phantom" rooms and potential spam.
      const [poll] = await db
        .select()
        .from(polls)
        .where(eq(polls.id, poll_id));

      if (!poll) {
        return socket.emit('error', { message: 'Poll not found' });
      }

      // Leave previous rooms if necessary (PulseBoard usually only shows one poll at a time)
      // socket.rooms.forEach(room => { if(room !== socket.id) socket.leave(room); });

      socket.join(poll_id);
      console.log(`✓ Client ${socket.id} joined poll: ${poll_id}`);
      
      // Acknowledge join
      socket.emit('joined', { poll_id });
    } catch (error) {
      console.error('Join poll error:', error);
      socket.emit('error', { message: 'Failed to join poll room' });
    }
  });

  // Leave poll room
  socket.on('leave-poll', (data) => {
    const { poll_id } = typeof data === 'string' ? { poll_id: data } : data;
    if (poll_id) {
      socket.leave(poll_id);
      console.log(`✓ Client ${socket.id} left poll: ${poll_id}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`✓ Client disconnected: ${socket.id} (Reason: ${reason})`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
}

/**
 * Broadcast vote update to all clients in poll room
 * Using centralized function ensures consistent data structure
 */
export function broadcastVoteUpdate(io, pollId, options) {
  if (!io) return;
  
  io.to(pollId).emit('vote-update', {
    poll_id: pollId,
    options,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast poll closed to all clients
 */
export function broadcastPollClosed(io, pollId) {
  if (!io) return;

  io.to(pollId).emit('poll-closed', {
    poll_id: pollId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast poll reset to all clients
 */
export function broadcastPollReset(io, pollId, options) {
  if (!io) return;

  io.to(pollId).emit('poll-reset', {
    poll_id: pollId,
    options,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast new poll created
 */
export function broadcastPollCreated(io, pollData) {
  if (!io) return;

  io.emit('poll-created', {
    poll: pollData,
    timestamp: new Date().toISOString(),
  });
}
