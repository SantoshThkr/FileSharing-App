import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

export default app;
