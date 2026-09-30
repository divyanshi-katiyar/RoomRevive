import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import app from './app.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runServer() {
  const isProd = process.env.NODE_ENV === 'production';
  // AI Studio Dev server uses port 3000; Cloud Run production injects process.env.PORT (e.g. 8080)
  const PORT = Number(process.env.PORT) || 3000;

  // Resolve dist directory containing the compiled client assets
  let distDir = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    if (fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
      distDir = path.join(__dirname, 'dist');
    } else if (fs.existsSync(path.join(__dirname, 'index.html'))) {
      distDir = __dirname;
    } else {
      distDir = path.resolve(process.cwd(), 'dist');
    }
  }

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite development middlewares
    app.use(vite.middlewares);
  } else {
    // In production, serve static assets built by Vite
    console.log(`[Production] Serving static files from: ${distDir}`);
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(500).send('Production client build (index.html) not found.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ RoomRevive AI server active on port ${PORT} [${isProd ? 'production' : 'development'}]`);
  });

  return server;
}

// Automatically invoke if running directly as bundled script in production
if (process.env.NODE_ENV === 'production' && !process.env.__SUBPROCESS_ENTRY__) {
  runServer().catch((err) => {
    console.error('Failed to start RoomRevive production server:', err);
    process.exit(1);
  });
}
