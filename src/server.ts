import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from './routes/auth.js';
import containerRoutes from './routes/containers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4200;

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', authMiddleware, containerRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

