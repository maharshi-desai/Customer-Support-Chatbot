# Agentic Customer Support System

A React + Vite e-commerce support dashboard with a built-in serverless backend at [api/support-query.js](/Users/apple/Desktop/Agentic-Customer-Support/api/support-query.js).

The backend now combines:

- a local FAQ knowledge base with 30 e-commerce questions and answers
- rule-based category, sentiment, and escalation detection
- Hugging Face chat completion for reply generation when `HF_TOKEN` is configured
- a deterministic fallback reply when Hugging Face is unavailable

## What The App Does

- provides an e-commerce support chat UI
- supports orders, returns, payments, account, and general queries
- sends chat requests to `/api/support-query`
- returns `reply`, `category`, `sentiment`, and `escalated`
- stores chat session history separately from analytics history
- shows dashboard analytics for support activity

## Tech Stack

- React 18
- Vite 5
- React Router
- Lucide React
- Vercel-style serverless API route
- Hugging Face Inference Providers via direct HTTP

## Backend Behavior

The frontend sends a `POST` request to `/api/support-query` with a JSON payload similar to:

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

The API responds with:

```json
{
  "reply": "Please share what happened during checkout and whether you saw an error or duplicate charge.",
  "category": "payments",
  "sentiment": "negative",
  "escalated": true
}
```

Extra fields such as `provider` or `warning` may also be included for debugging, but the frontend only depends on:

- `reply`
- `category`
- `sentiment`
- `escalated`

## FAQ Layer

The backend now checks a local FAQ dataset first for common e-commerce questions. This includes 30 built-in entries covering:

- order tracking, delays, cancellations, shipping, and preorders
- return windows, refund timelines, exchanges, and damaged items
- payment methods, failed payments, duplicate charges, invoices, and gift cards
- password reset, locked accounts, guest checkout, account creation, and email updates

If a FAQ match is found, the backend returns that answer directly before using Hugging Face or the generic fallback response.

## Environment Setup

This repo includes:

- [.env.example](/Users/apple/Desktop/Agentic-Customer-Support/.env.example)
- [.env.local](/Users/apple/Desktop/Agentic-Customer-Support/.env.local)

Relevant environment variables:

```bash
VITE_SUPPORT_API_URL=/api/support-query
HF_TOKEN=hf_your_token_here
HF_MODEL=Qwen/Qwen2.5-7B-Instruct:fastest
```

Vercel project config is included in [vercel.json](/Users/apple/Desktop/Agentic-Customer-Support/vercel.json).

Notes:

- `HF_TOKEN` is optional in code, but required if you want AI-generated replies from Hugging Face.
- if `HF_TOKEN` is missing or the Hugging Face request fails, the backend falls back to rule-based support replies
- `HF_MODEL` defaults to `Qwen/Qwen2.5-7B-Instruct:fastest`

## Local Development

Install dependencies:

```bash
npm install
```

Run the frontend build tooling:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Important:

- `npm run dev` runs the Vite frontend
- the `api/` route is a serverless function, so if you want to exercise `/api/support-query` locally as an actual function, use your deployment platform's local dev flow
- on Vercel, that means running the app through Vercel's local environment with your env vars configured

## Vercel Deployment

This project now includes a Vercel config that:

- declares the `vite` framework
- uses `dist` as the output directory
- sets a 20-second max duration for `api/support-query.js`

For deployment:

1. Import the repo into Vercel.
2. Add `HF_TOKEN` in the Vercel project environment variables.
3. Optionally add `HF_MODEL` if you want to override the default model.
4. Deploy.

If `HF_TOKEN` is missing in Vercel, the app will still work using the rule-based fallback responses.

## Recommended Hugging Face Model

This project is set up to use:

```bash
Qwen/Qwen2.5-7B-Instruct:fastest
```

This is a good fit because it follows instructions well and is a practical choice for short customer support replies.

## How The Backend Decides Things

### Rule-based logic

The serverless route uses deterministic logic to:

- infer support category
- detect escalation triggers
- infer basic sentiment

Examples of escalation triggers:

- fraud
- unauthorized charge
- charged twice
- hacked account
- locked account access

Examples of smarter fallback handling:

- tracking and delayed orders
- refund status and return setup
- duplicate or unauthorized charges
- password reset and locked account access

### Hugging Face generation

When `HF_TOKEN` is present, the backend sends a chat completion request to Hugging Face and asks the model to generate a concise plain-text support reply.

If the Hugging Face request fails, the route still returns a safe fallback response so the UI keeps working.

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
api/
  support-query.js
.env.example
.env.local
vite.config.js
package.json
```

## Important Files

### [src/components/Chat.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/components/Chat.jsx)

- sends requests to `/api/support-query`
- builds the support payload
- parses flexible backend responses
- keeps the frontend API contract simple

### [api/support-query.js](/Users/apple/Desktop/Agentic-Customer-Support/api/support-query.js)

- checks the local FAQ dataset first
- runs rule-based support classification
- calls Hugging Face when configured
- falls back to deterministic replies when needed
- returns the response shape expected by the frontend

### [data/faqs.js](/Users/apple/Desktop/Agentic-Customer-Support/data/faqs.js)

- contains 30 built-in FAQ entries
- groups answers by orders, returns, payments, account, and general support

### [src/App.jsx](/Users/apple/Desktop/Agentic-Customer-Support/src/App.jsx)

- manages chat session storage
- manages dashboard analytics persistence
- routes between chat and dashboard

## Next Improvements

- store conversations in a real database
- add admin authentication
- connect real order and payment systems
- add ticket creation for escalated cases
- add tests for backend classification rules

## License

This repository currently has no explicit license file.
