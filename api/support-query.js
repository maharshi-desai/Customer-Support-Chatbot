export default async function handler(request, response) {
  const webhookUrl = process.env.N8N_SUPPORT_WEBHOOK_URL;

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!webhookUrl) {
    return response.status(500).json({
      error: "Missing N8N_SUPPORT_WEBHOOK_URL environment variable",
    });
  }

  try {
    const upstreamResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.body ?? {}),
    });

    const contentType = upstreamResponse.headers.get("content-type") || "";
    const rawBody = await upstreamResponse.text();

    response.status(upstreamResponse.status);

    if (contentType.includes("application/json")) {
      response.setHeader("Content-Type", "application/json");

      try {
        return response.send(rawBody ? JSON.parse(rawBody) : {});
      } catch {
        return response.send(rawBody);
      }
    }

    response.setHeader("Content-Type", contentType || "text/plain; charset=utf-8");
    return response.send(rawBody);
  } catch (error) {
    return response.status(502).json({
      error: "Failed to reach n8n webhook",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
