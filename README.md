# Agentic Customer Support System

A React + Vite customer support dashboard that connects a chat UI to an n8n webhook and visualizes support analytics in a separate dashboard view.

The project is designed for an e-commerce support use case. Users can ask questions about orders, refunds, payments, and account issues, while the dashboard tracks message volume, sentiment, escalation trends, and support categories.

## What This Project Does

- Provides a clean customer support chat interface
- Sends user queries to an n8n production webhook
- Renders the webhook response back into the chat
- Tracks sentiment, categories, and escalation state for bot replies
- Shows aggregated conversation insights on a dashboard
- Keeps chat history for the current browser session
- Keeps dashboard analytics across visits using persistent browser storage

## Tech Stack

- React 18
- Vite 5
- React Router
- Lucide React icons
- n8n webhook integration

## App Flow

1. A user opens the chat UI.
2. The user sends a support message.
3. The frontend sends a `POST` request to the configured n8n webhook.
4. n8n processes the request and returns a support reply plus metadata.
5. The frontend normalizes the response and displays:
   - reply text
   - category
   - sentiment
   - escalation state
6. Bot replies are also added to the analytics dataset shown in the dashboard.

## Pages

### Chat

The chat page is the main support assistant interface.

- Route: `/`
- Component: [src/components/Chat.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/components/Chat.jsx)

Features:

- domain selector for support type
- chat bubbles for user and assistant messages
- loading indicator while the webhook request is in progress
- defensive parsing for different webhook response shapes
- fallback escalation and sentiment inference when n8n omits metadata

### Dashboard

The dashboard page summarizes support activity.

- Route: `/dashboard`
- Component: [src/components/Dashboard.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/components/Dashboard.jsx)

Metrics shown:

- total messages
- escalated cases
- positive sentiment count
- technical case count
- sentiment breakdown
- category breakdown

## Storage Behavior

The project intentionally separates chat session state from analytics state.

### Chat history

Chat history is stored in `sessionStorage`.

- It stays when the user refreshes the page
- It resets when a new browser session starts

### Dashboard analytics

Dashboard analytics are stored in `localStorage`.

- They persist across page reloads
- They persist across reopened browser sessions
- They continue to accumulate until local storage is cleared

This behavior is managed in [src/App.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/App.jsx).

## Webhook Configuration

By default, the frontend sends requests to:

```txt
http://localhost:5678/webhook/support-query
```

In local development, this is configured in [src/components/Chat.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/components/Chat.jsx).

In production, the frontend sends requests to:

```txt
/api/support-query
```

That Vercel serverless route forwards the request to your public n8n webhook using the `N8N_SUPPORT_WEBHOOK_URL` server environment variable.

You can override it with:

```bash
VITE_SUPPORT_WEBHOOK_URL=http://localhost:5678/webhook/support-query
```

Create a `.env` file in the project root if you want to change the webhook without editing code:

```bash
VITE_SUPPORT_WEBHOOK_URL=http://localhost:5678/webhook/support-query
```

## Deployment On Vercel

This repo includes a Vercel serverless proxy at [api/support-query.js](/Users/apple/Desktop/Agentic-Customer-Support/api/support-query.js) so the browser does not call n8n directly.

Why this matters:

- the browser avoids CORS issues
- your frontend does not need to expose the raw webhook URL
- Vercel calls n8n server-to-server

### What you still need

Your n8n webhook must be reachable from the public internet. A browser on another laptop cannot use `http://localhost:5678/...` because `localhost` always means that person’s own machine.

You have two options:

- deploy n8n publicly
- expose your local n8n temporarily with a tunnel such as `ngrok` or `cloudflared`

### Vercel setup steps

1. Make sure your n8n production webhook works from a public URL.
2. In Vercel, open your project settings.
3. Go to `Environment Variables`.
4. Add:

```bash
N8N_SUPPORT_WEBHOOK_URL=https://your-public-n8n-url/webhook/support-query
```

5. Redeploy the project.
6. Open the deployed site and test the chat again.

### Temporary demo setup with a tunnel

If your n8n is still running only on your laptop, expose it first.

Using `cloudflared`:

```bash
cloudflared tunnel --url http://localhost:5678
```

or using `ngrok`:

```bash
ngrok http 5678
```

Then take the generated public URL and use:

```bash
https://your-public-url/webhook/support-query
```

as the value of `N8N_SUPPORT_WEBHOOK_URL` in Vercel.

## Request Payload Sent To n8n

The frontend sends a JSON body similar to:

```json
{
  "message": "My payment failed",
  "query": "My payment failed",
  "text": "My payment failed",
  "chatInput": "My payment failed",
  "domain": "payments",
  "category": "payments",
  "source": "dashboard",
  "messages": [
    {
      "sender": "user",
      "text": "My payment failed",
      "timestamp": "06:11 PM",
      "domain": "payments"
    }
  ]
}
```

The frontend includes multiple text keys because n8n workflows often vary in how they read input fields.

## Expected Response Shape From n8n

The best response format is:

```json
{
  "reply": "Please try again or use a different payment method. Contact support if issue persists",
  "category": "payments",
  "sentiment": "negative",
  "escalated": false
}
```

The frontend can also handle looser responses such as:

- a plain string
- `{ "message": "..." }`
- `{ "output": "..." }`
- `{ "escalate": true }`

If `escalated` or `sentiment` are missing, the frontend applies fallbacks based on the reply text.

## n8n Workflow Notes

This project was built around an n8n `Webhook` node using a `Respond to Webhook` node.

Recommended setup:

- `Webhook` method: `POST`
- `Webhook` path: `support-query`
- `Webhook` response mode: `Using Respond to Webhook Node`
- exactly one active response path should end in `Respond to Webhook`

Recommended response object from n8n:

```json
{
  "reply": "Your support response here",
  "category": "general",
  "sentiment": "neutral",
  "escalated": false
}
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```txt
src/
  components/
    Chat.jsx
    Dashboard.jsx
    InputBox.jsx
    MessageBubble.jsx
    Navbar.jsx
  App.jsx
  main.jsx
  styles.css
vite.config.js
package.json
```

## Important Components

### [src/App.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/App.jsx)

- owns shared app state
- separates session chat storage from persistent analytics storage
- routes between chat and dashboard
- normalizes legacy and live messages

### [src/components/Chat.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/components/Chat.jsx)

- handles webhook submission
- builds request payload
- parses webhook responses
- infers missing escalation and sentiment metadata

### [src/components/Dashboard.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/components/Dashboard.jsx)

- computes summary metrics from persistent analytics messages
- renders sentiment and category breakdowns

### [src/components/MessageBubble.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/components/MessageBubble.jsx)

- displays chat messages
- shows category, sentiment, and escalation badges

## Troubleshooting

### `Unused Respond to Webhook node found in the workflow`

This means the n8n webhook configuration is inconsistent.

Check that:

- the `Webhook` node is set to respond using `Respond to Webhook`
- the active execution path actually reaches the `Respond to Webhook` node
- the workflow is saved and activated after making changes

### The app still uses an old n8n workflow

If the frontend calls `/webhook/support-query`, n8n uses the active production workflow, not the draft currently open in the editor.

After workflow changes:

1. Save the workflow
2. Re-activate it
3. Test the production webhook again

### FAQ answers are inconsistent

If n8n uses an LLM to search FAQs, answers may vary. For deterministic FAQ behavior, prefer a `Code` node with explicit pattern matching over a free-form LLM response.

### Sentiment looks wrong for escalated responses

If n8n does not return a `sentiment` field, the frontend applies a fallback. For best results, return `sentiment` explicitly from n8n.

## Future Improvements

- align n8n categories with UI domain values:
  - `orders`
  - `returns-refunds`
  - `payments`
  - `account`
  - `general`
- move analytics persistence to a backend or database
- add clear analytics reset controls
- add automated tests for webhook response normalization
- add authentication for internal dashboard usage

## License

This project currently has no explicit license file in the repository.
