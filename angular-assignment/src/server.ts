import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Remove strict CSP for development
 */
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader.bind(res);
  
  res.setHeader = function(name: string, value: any) {
    // Intercept CSP header and modify it for development
    if (name === 'Content-Security-Policy') {
      const isDevelopment = process.env['NODE_ENV'] !== 'production';
      
      if (isDevelopment) {
        // Set permissive CSP for development
        return originalSetHeader.call(
          this,
          name,
          "default-src 'self'; " +
          "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline';"
        );
      }
    }
    return originalSetHeader.call(this, name, value);
  };
  
  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);