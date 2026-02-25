import express, { Express } from 'express';
import 'dotenv/config';
import { corsMiddleware } from './middleware/cors';
import { initializeDatabase } from './db/init';
import { loadOpenSATData } from './services/opensat';
import questionsRouter from './routes/questions';
import { createProgressRouter } from './routes/progress';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Initialize and start server
async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    const db = await initializeDatabase();

    // Load OpenSAT data
    console.log('Loading OpenSAT data...');
    await loadOpenSATData();

    // Routes
    app.use('/api', questionsRouter);
    app.use('/api/progress', createProgressRouter(db));

    // 404 handler
    app.use((_req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not found',
      });
    });

    // Error handler
    app.use(
      (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        console.error('Server error:', err);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    );

    app.listen(PORT, () => {
      console.log(`HapaSAT backend listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
