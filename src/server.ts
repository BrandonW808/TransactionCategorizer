import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Transaction Categorizer API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      categories: 'GET /api/categories',
      categorize: 'POST /api/categorize',
      categorizeCsv: 'POST /api/categorize-csv',
      parseCsv: 'POST /api/parse-csv',
      exportCsv: 'POST /api/export-csv'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Transaction Categorizer API running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
});

export default app;
