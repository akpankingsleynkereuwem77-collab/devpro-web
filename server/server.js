import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contactRouter, contactLimiter } from './routes/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(projectRoot, 'public'), { extensions: ['html'] }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/contact', contactLimiter, contactRouter);
app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large.' });
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ message: 'Request body must be valid JSON.' });
  console.error('Unhandled server error:', error?.message || 'Unknown error');
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`DevPro server listening on http://localhost:${port}`));
}

export default app;
