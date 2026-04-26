import { FAQ_ENTRIES } from "../data/faqs.js";

const HF_CHAT_COMPLETIONS_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen2.5-7B-Instruct:fastest";
const VALID_CATEGORIES = new Set([
  "orders",
  "returns-refunds",
  "payments",
  "account",
  "general",
]);

function normalizeCategory(value) {
  if (typeof value !== "string") {
    return "general";
  }

  const normalizedValue = value.trim().toLowerCase();
  return VALID_CATEGORIES.has(normalizedValue) ? normalizedValue : "general";
}

function extractMessage(body) {
  const candidates = [body?.message, body?.query, body?.text, body?.chatInput];
  return candidates.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferCategory(message, requestedCategory) {
  const normalizedRequestedCategory = normalizeCategory(requestedCategory);

  if (normalizedRequestedCategory !== "general") {
    return normalizedRequestedCategory;
  }

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("track") ||
    normalizedMessage.includes("shipment") ||
    normalizedMessage.includes("shipping") ||
    normalizedMessage.includes("delivered") ||
    normalizedMessage.includes("order") ||
    normalizedMessage.includes("package")
  ) {
    return "orders";
  }

  if (
    normalizedMessage.includes("refund") ||
    normalizedMessage.includes("return") ||
    normalizedMessage.includes("exchange") ||
    normalizedMessage.includes("replace")
  ) {
    return "returns-refunds";
  }

  if (
    normalizedMessage.includes("payment") ||
    normalizedMessage.includes("charged") ||
    normalizedMessage.includes("billing") ||
    normalizedMessage.includes("card") ||
    normalizedMessage.includes("transaction")
  ) {
    return "payments";
  }

  if (
    normalizedMessage.includes("account") ||
    normalizedMessage.includes("login") ||
    normalizedMessage.includes("password") ||
    normalizedMessage.includes("sign in") ||
    normalizedMessage.includes("profile")
  ) {
    return "account";
  }

  return "general";
}

function inferSentiment(message, escalated) {
  const normalizedMessage = message.toLowerCase();

  if (
    escalated ||
    normalizedMessage.includes("angry") ||
    normalizedMessage.includes("frustrated") ||
    normalizedMessage.includes("failed") ||
    normalizedMessage.includes("not working") ||
    normalizedMessage.includes("problem") ||
    normalizedMessage.includes("issue")
  ) {
    return "negative";
  }

  if (
    normalizedMessage.includes("thanks") ||
    normalizedMessage.includes("thank you") ||
    normalizedMessage.includes("great") ||
    normalizedMessage.includes("awesome")
  ) {
    return "positive";
  }

  return "neutral";
}

function inferEscalation(message, category) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("fraud") ||
    normalizedMessage.includes("legal") ||
    normalizedMessage.includes("lawsuit") ||
    normalizedMessage.includes("chargeback") ||
    normalizedMessage.includes("scam") ||
    normalizedMessage.includes("hacked") ||
    normalizedMessage.includes("stolen")
  ) {
    return true;
  }

  if (
    category === "payments" &&
    (
      normalizedMessage.includes("charged twice") ||
      normalizedMessage.includes("double charged") ||
      normalizedMessage.includes("duplicate charge") ||
      normalizedMessage.includes("payment failed") ||
      normalizedMessage.includes("unauthorized charge") ||
      normalizedMessage.includes("unknown charge") ||
      normalizedMessage.includes("didn't make this charge")
    )
  ) {
    return true;
  }

  if (
    category === "account" &&
    (
      normalizedMessage.includes("cannot access") ||
      normalizedMessage.includes("locked out") ||
      normalizedMessage.includes("account locked") ||
      normalizedMessage.includes("login blocked")
    )
  ) {
    return true;
  }

  if (
    category === "returns-refunds" &&
    (
      normalizedMessage.includes("damaged item") ||
      normalizedMessage.includes("wrong item") ||
      normalizedMessage.includes("defective item") ||
      normalizedMessage.includes("broken product")
    )
  ) {
    return true;
  }

  return false;
}

function detectIssueType(message, category) {
  const normalizedMessage = message.toLowerCase();

  if (category === "orders") {
    if (
      normalizedMessage.includes("track") ||
      normalizedMessage.includes("where is my order") ||
      normalizedMessage.includes("shipping status")
    ) {
      return "tracking";
    }

    if (
      normalizedMessage.includes("late") ||
      normalizedMessage.includes("delayed") ||
      normalizedMessage.includes("not arrived")
    ) {
      return "delay";
    }

    if (
      normalizedMessage.includes("cancel") ||
      normalizedMessage.includes("change address") ||
      normalizedMessage.includes("edit order")
    ) {
      return "order-change";
    }
  }

  if (category === "returns-refunds") {
    if (
      normalizedMessage.includes("refund status") ||
      normalizedMessage.includes("where is my refund") ||
      normalizedMessage.includes("refund not received")
    ) {
      return "refund-status";
    }

    if (
      normalizedMessage.includes("return label") ||
      normalizedMessage.includes("start return") ||
      normalizedMessage.includes("return item")
    ) {
      return "return-start";
    }

    if (
      normalizedMessage.includes("damaged") ||
      normalizedMessage.includes("wrong item") ||
      normalizedMessage.includes("defective")
    ) {
      return "damaged-item";
    }
  }

  if (category === "payments") {
    if (
      normalizedMessage.includes("payment failed") ||
      normalizedMessage.includes("declined") ||
      normalizedMessage.includes("checkout error")
    ) {
      return "payment-failed";
    }

    if (
      normalizedMessage.includes("charged twice") ||
      normalizedMessage.includes("double charged") ||
      normalizedMessage.includes("duplicate charge")
    ) {
      return "double-charge";
    }

    if (
      normalizedMessage.includes("unauthorized") ||
      normalizedMessage.includes("didn't make this charge") ||
      normalizedMessage.includes("unknown charge")
    ) {
      return "unauthorized-charge";
    }
  }

  if (category === "account") {
    if (
      normalizedMessage.includes("password") ||
      normalizedMessage.includes("reset password")
    ) {
      return "password-reset";
    }

    if (
      normalizedMessage.includes("locked out") ||
      normalizedMessage.includes("account locked") ||
      normalizedMessage.includes("cannot access")
    ) {
      return "locked-account";
    }

    if (
      normalizedMessage.includes("email") ||
      normalizedMessage.includes("profile") ||
      normalizedMessage.includes("update account")
    ) {
      return "profile-update";
    }
  }

  return "general";
}

function findFaqMatch(message, requestedCategory) {
  const normalizedMessage = normalizeText(message);
  const normalizedRequestedCategory = normalizeCategory(requestedCategory);

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of FAQ_ENTRIES) {
    let score = 0;

    if (entry.category === normalizedRequestedCategory && normalizedRequestedCategory !== "general") {
      score += 1;
    }

    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (!normalizedKeyword) {
        continue;
      }

      if (normalizedMessage === normalizedKeyword) {
        score += 4;
        continue;
      }

      if (normalizedMessage.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 3 : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

function buildFallbackReply(category, escalated, issueType) {
  switch (category) {
    case "orders":
      if (issueType === "tracking") {
        return escalated
          ? "I am escalating this order tracking issue to a human support agent. Please share your order number and the latest shipping update you received."
          : "I can help with order tracking. Please share your order number and I will guide you on checking shipment progress or the latest delivery update.";
      }

      if (issueType === "delay") {
        return escalated
          ? "I am escalating this delayed order issue to a human support agent. Please share your order number and the promised delivery date so the team can investigate."
          : "I can help with a delayed order. Please share your order number and the expected delivery date so I can guide you on the next steps.";
      }

      if (issueType === "order-change") {
        return escalated
          ? "I am escalating this order change request to a human support agent. Please share your order number and the exact update you need, such as cancellation or address correction."
          : "I can help with order changes. Please share your order number and tell me whether you need to cancel, update the address, or modify the items.";
      }

      return escalated
        ? "I am escalating this order issue to a human support agent. Please share your order number and any delivery updates you have received."
        : "I can help with your order. Please share your order number so I can guide you on tracking, shipping status, or delivery next steps.";
    case "returns-refunds":
      if (issueType === "refund-status") {
        return escalated
          ? "I am escalating your refund status issue to a human support agent. Please share your order number, refund request date, and payment method used."
          : "I can help check your refund status. Please share your order number and when the refund was requested so I can guide you on the expected timeline.";
      }

      if (issueType === "return-start") {
        return escalated
          ? "I am escalating your return setup issue to a human support agent. Please share your order number and the item you want to return."
          : "I can help you start a return. Please share your order number, the item you want to return, and the reason for the return.";
      }

      if (issueType === "damaged-item") {
        return escalated
          ? "I am escalating this damaged or incorrect item issue to a human support agent. Please share your order number and describe the item condition so the team can review it."
          : "I can help with a damaged or incorrect item. Please share your order number and describe what arrived so I can guide you on return or replacement steps.";
      }

      return escalated
        ? "I am escalating your return or refund request to a human support agent. Please share your order number and the item details so the team can review it."
        : "I can help with returns and refunds. Please share your order number and tell me whether you want a return, exchange, or refund.";
    case "payments":
      if (issueType === "payment-failed") {
        return escalated
          ? "I am escalating this payment failure to a human support agent. Please share the checkout error message, if any, and do not retry repeatedly until the issue is reviewed."
          : "I can help with a failed payment. Please share the checkout error message, if any, and tell me whether the charge still appeared on your card or wallet.";
      }

      if (issueType === "double-charge") {
        return "I am escalating this duplicate charge issue to a human support agent. Please share your order number, payment method, and the two charge timestamps if you can see them.";
      }

      if (issueType === "unauthorized-charge") {
        return "I am escalating this unauthorized charge issue to a human support agent immediately. Please share the charge date, amount, and any order details you recognize, and avoid retrying payment until the team reviews it.";
      }

      return escalated
        ? "I am escalating this payment issue to a human support agent. Please do not retry the payment until the team reviews the charge or failure."
        : "I can help with payment issues. Please share what happened during checkout and whether you saw an error or duplicate charge.";
    case "account":
      if (issueType === "password-reset") {
        return escalated
          ? "I am escalating this password reset issue to a human support agent. Please describe what happens when you try to reset your password and whether you receive the reset email."
          : "I can help with password reset issues. Please tell me whether you are missing the reset email, seeing an error, or unable to sign in after resetting.";
      }

      if (issueType === "locked-account") {
        return "I am escalating this account access issue to a human support agent. Please describe whether the account is locked, whether you can still access your email, and any error message you see.";
      }

      if (issueType === "profile-update") {
        return escalated
          ? "I am escalating this profile update issue to a human support agent. Please describe which account detail you are trying to change and what error appears."
          : "I can help with account updates. Please tell me whether you need to update your email, profile details, or another account setting.";
      }

      return escalated
        ? "I am escalating this account issue to a human support agent. Please describe the login or access problem so the team can help securely."
        : "I can help with your account. Please describe whether this is about login, password reset, profile updates, or account access.";
    default:
      return escalated
        ? "I am escalating this support issue to a human support agent. Please share any order, payment, or account details that will help the team assist you."
        : "I can help with orders, returns, payments, and account support. Please share a few more details so I can guide you to the right next step.";
  }
}

function sanitizeConversation(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (message) =>
        typeof message?.text === "string" &&
        message.text.trim() &&
        (message.sender === "user" || message.sender === "bot"),
    )
    .slice(-6)
    .map((message) => ({
      role: message.sender === "bot" ? "assistant" : "user",
      content: message.text.trim(),
    }));
}

function extractReplyContent(data) {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const textContent = content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .join(" ")
      .trim();

    if (textContent) {
      return textContent;
    }
  }

  return "";
}

function buildPrompt({ message, category, sentiment, escalated }) {
  return [
    `Customer message: ${message}`,
    `Detected support category: ${category}`,
    `Detected sentiment: ${sentiment}`,
    `Escalation needed: ${escalated ? "yes" : "no"}`,
    "Write a concise e-commerce support reply in plain text.",
    "Do not invent order status, refunds, or account actions.",
    "If details are missing, ask for the minimum useful next detail such as order number or transaction context.",
    "Keep the reply under 90 words.",
    "Do not output JSON or markdown bullets.",
  ].join("\n");
}

async function generateModelReply({
  hfToken,
  model,
  message,
  history,
  category,
  sentiment,
  escalated,
}) {
  const completionResponse = await fetch(HF_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You are an e-commerce customer support AI. Be helpful, calm, and practical. Use the provided category and escalation context. Never claim to have processed refunds, changed accounts, or looked up live order data unless the prompt explicitly says so.",
        },
        ...history,
        {
          role: "user",
          content: buildPrompt({ message, category, sentiment, escalated }),
        },
      ],
    }),
  });

  const rawResponse = await completionResponse.text();
  let parsedResponse = {};

  try {
    parsedResponse = rawResponse ? JSON.parse(rawResponse) : {};
  } catch {
    parsedResponse = {};
  }

  if (!completionResponse.ok) {
    const errorMessage =
      parsedResponse?.error?.message ||
      parsedResponse?.message ||
      parsedResponse?.error ||
      rawResponse ||
      `Hugging Face request failed with status ${completionResponse.status}`;

    throw new Error(errorMessage);
  }

  const reply = extractReplyContent(parsedResponse);

  if (!reply) {
    throw new Error("Hugging Face response did not include a reply.");
  }

  return reply;
}

export async function getSupportResponse(body = {}) {
  const message = extractMessage(body);

  if (!message) {
    return {
      status: 400,
      body: {
      error: "A support message is required.",
      },
    };
  }

  const category = inferCategory(
    message,
    body?.domain || body?.category,
  );
  const faqMatch = findFaqMatch(message, body?.domain || body?.category);
  const issueType = detectIssueType(message, category);
  const escalated = inferEscalation(message, category);
  const sentiment = inferSentiment(message, escalated);
  const fallbackReply = buildFallbackReply(category, escalated, issueType);
  const history = sanitizeConversation(body?.messages);
  const hfToken = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || DEFAULT_MODEL;

  try {
    if (faqMatch) {
      const faqEscalated = Boolean(faqMatch.escalated) || escalated;
      const faqSentiment = inferSentiment(message, faqEscalated);

      return {
        status: 200,
        body: {
          reply: faqMatch.answer,
          category: faqMatch.category,
          sentiment: faqSentiment,
          escalated: faqEscalated,
          provider: "faq",
          faqId: faqMatch.id,
        },
      };
    }

    const reply = hfToken
      ? await generateModelReply({
          hfToken,
          model,
          message,
          history,
          category,
          sentiment,
          escalated,
        })
      : fallbackReply;

    return {
      status: 200,
      body: {
        reply,
        category,
        sentiment,
        escalated,
        provider: hfToken ? "hugging-face" : "rule-based-fallback",
      },
    };
  } catch (error) {
    console.error("Support backend failed, using fallback reply:", error);

    return {
      status: 200,
      body: {
        reply: fallbackReply,
        category,
        sentiment,
        escalated,
        provider: "rule-based-fallback",
        warning: error instanceof Error ? error.message : "Unknown backend error",
      },
    };
  }
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const result = await getSupportResponse(request.body ?? {});
  return response.status(result.status).json(result.body);
}
