import express from 'express';
import designRoutes from './routes/designRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Enable large JSON payloads for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/design', designRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/shop', shopRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RoomRevive AI',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
