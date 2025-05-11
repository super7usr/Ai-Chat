import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [Json, ...args]);
  };

  res.on("finish", () =>    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "";
      }

      log(logLine);
    }
  });

  res.on("error", (err) => {
    log(`Error occurred while handling request: ${err.message}`);
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app((err: any, _req: Request, res: Response, _next: NextFunction) => {
 status = err.status || err.statusCode || 500;
      const = err.message || "Internal Server";

      res.status(status).json({ message });
      log(`Error occurred: ${err.message}`);
      // Removed throw to prevent crashing the server    });

    if (app.get("env") "development") {
      try {
        await setupVite(app, server);
      } catch (err) {
        log(`Error Vite: ${err.message}`);
        process.exit();
      }
 } else {
      serveStatic(app);
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true    }, => {
      log(`serving on port ${port}`);
    });

    server.on("error", (err) => {
      log(`Error occurred while listening on port ${port}: ${err.message}`);
      process.exit(1);
    });
  } catch (err) {
    log(`Error occurred during initialization: ${err.message}`);
    process.exit(1);
  }
})();