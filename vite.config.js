import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { getSupportResponse } from "./api/support-query.js";

function localSupportApiPlugin() {
  return {
    name: "local-support-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestPath = req.url?.split("?")[0];

        if (requestPath !== "/api/support-query") {
          return next();
        }

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const body = await new Promise((resolve, reject) => {
            let rawBody = "";

            req.on("data", (chunk) => {
              rawBody += chunk;
            });

            req.on("end", () => {
              if (!rawBody) {
                resolve({});
                return;
              }

              try {
                resolve(JSON.parse(rawBody));
              } catch (error) {
                reject(error);
              }
            });

            req.on("error", reject);
          });

          const result = await getSupportResponse(body);

          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Local API execution failed",
              details: error instanceof Error ? error.message : "Unknown error",
            }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), localSupportApiPlugin()],
    server: {
      port: 5173,
    },
  };
});
