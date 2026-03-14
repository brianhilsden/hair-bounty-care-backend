import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // In development, allow all origins for ease of testing
      callback(null, true);
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(requestLogger);

// Rate limiting
app.use(`/api/${env.API_VERSION}`, apiRateLimiter);

// API routes
app.use(`/api/${env.API_VERSION}`, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
