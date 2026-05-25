# PulseBoard Server

Real-time live polling backend for PulseBoard.

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe ORM
- **Socket.io** - Real-time WebSocket

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string.

### 3. Start Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Polls

- `POST /api/polls/create` - Create new poll
- `GET /api/polls/:id` - Get poll with options
- `POST /api/polls/:id/close` - Close poll
- `POST /api/polls/:id/reset` - Reset votes

### Votes

- `POST /api/votes` - Submit vote

### Feedback

- `POST /api/feedback` - Submit feedback
- `GET /api/polls/:poll_id/feedback` - Get feedback

## WebSocket Events

### Client → Server

- `join-poll` - Join poll room
- `leave-poll` - Leave poll room

### Server → Client

- `vote-update` - Broadcast vote changes
- `poll-closed` - Poll closed
- `poll-reset` - Votes reset

## Database Schema

### polls
- id (UUID)
- question (text)
- is_closed (boolean)
- allow_multiple (boolean)
- created_at (timestamp)
- expires_at (timestamp)

### poll_options
- id (UUID)
- poll_id (UUID FK)
- option_text (text)
- vote_count (integer)
- created_at (timestamp)

### feedback
- id (UUID)
- poll_id (UUID FK)
- feedback_text (text)
- created_at (timestamp)

## Development

Run with auto-reload:
```bash
npm run dev
```

## Production

Build and start:
```bash
npm start
```

## License

MIT
