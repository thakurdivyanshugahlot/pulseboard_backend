import http from 'http';
import { Server as SocketIO } from 'socket.io';
import { createApp } from './src/app.js';
import { testConnection, closePool } from './src/db/index.js';
import { config } from './src/config/db.js';
import { handleSocketConnection } from './src/sockets/socketHandler.js';

async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    /**
     * Production Note:
     * In a multi-server environment (e.g. Kubernetes, multiple PM2 instances),
     * you MUST use a Socket.io Adapter (like Redis) to broadcast events
     * across all instances.
     * Example: io.adapter(createAdapter(pubClient, subClient));
     */

    // 1. Create the Express app instance (without routes yet if you prefer,
    // but here we'll just pass io later or use a middleware)
    // Actually, we can create the httpServer first with a placeholder
    const httpServer = http.createServer();

    // 2. Initialize Socket.io
    const io = new SocketIO(httpServer, {
      cors: {
        origin: config.frontendUrl,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // 3. Create the Express app with the io instance
    const app = createApp(io);

    // 4. Attach app to httpServer
    httpServer.on('request', app);

    // Socket.io connection handler
    io.on('connection', (socket) => {
      handleSocketConnection(socket, io);
    });

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`
📍 Server: http://localhost:${config.port}
🌐 Frontend: ${config.frontendUrl}
📊 WebSocket: Enabled
🔌 Environment: ${config.nodeEnv}

✓ Ready to accept connections!
      `);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down gracefully...');
      
      // Close Socket.io first to stop new events
      io.close();
      
      // Close HTTP server
      httpServer.close(async () => {
        await closePool();
        console.log('✓ Server closed');
        process.exit(0);
      });

      // Force exit if not closed in 10s
      setTimeout(() => {
        console.error('Forcefully shutting down...');
        process.exit(1);
      }, 10000);
    });

    // Error handling
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
