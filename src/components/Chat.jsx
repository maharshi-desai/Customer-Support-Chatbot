import { useEffect, useRef, useState } from "react";
import {
  CircleUserRound,
  CreditCard,
  LayoutGrid,
  MessageSquareText,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import InputBox from "./InputBox";
import MessageBubble from "./MessageBubble";

const normalizeValue = (value, fallback) =>
  typeof value === "string" && value.trim()
    ? value.trim().toLowerCase()
    : fallback;

const SUPPORT_WEBHOOK_URL =
  import.meta.env.VITE_SUPPORT_WEBHOOK_URL ||
  "http://localhost:5678/webhook/support-query";

const getReplyText = (data) => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data?.reply === "string" && data.reply.trim()) {
    return data.reply;
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.output === "string" && data.output.trim()) {
    return data.output;
  }

  return "I'm here to help, but I didn't receive a response.";
};

const inferEscalation = (data, replyText) => {
  if (typeof data?.escalated === "boolean") {
    return data.escalated;
  }

  if (typeof data?.escalate === "boolean") {
    return data.escalate;
  }

  const normalizedReply = typeof replyText === "string" ? replyText.toLowerCase() : "";

  return (
    normalizedReply.includes("escalated to a human") ||
    normalizedReply.includes("escalated to human") ||
    normalizedReply.includes("human agent") ||
    normalizedReply.includes("transferred to an agent")
  );
};

const inferSentiment = (data, replyText, escalated) => {
  const rawSentiment =
    typeof data?.sentiment === "string" && data.sentiment.trim()
      ? data.sentiment.trim().toLowerCase()
      : "";

  if (rawSentiment) {
    if (escalated && rawSentiment === "neutral") {
      return "negative";
    }

    return rawSentiment;
  }

  const normalizedReply = typeof replyText === "string" ? replyText.toLowerCase() : "";

  if (
    escalated ||
    normalizedReply.includes("failed") ||
    normalizedReply.includes("frustrated") ||
    normalizedReply.includes("issue") ||
    normalizedReply.includes("problem")
  ) {
    return "negative";
  }

  return "neutral";
};

const parseWebhookResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const domainOptions = [
  { value: "orders", label: "📦 Orders", icon: Package },
  { value: "returns-refunds", label: "🔁 Returns & Refunds", icon: RotateCcw },
  { value: "payments", label: "💳 Payments", icon: CreditCard },
  { value: "account", label: "👤 Account", icon: CircleUserRound },
  { value: "general", label: "💬 General", icon: LayoutGrid },
];

function Chat({ messages, appendMessage, createTimestamp }) {
  const [inputValue, setInputValue] = useState("");
  const [domain, setDomain] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedDomainOption =
    domainOptions.find((option) => option.value === domain) ?? domainOptions[4];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedMessage,
      timestamp: createTimestamp(),
      domain,
    };

    appendMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      const requestPayload = {
        message: trimmedMessage,
        query: trimmedMessage,
        text: trimmedMessage,
        chatInput: trimmedMessage,
        domain,
        category: domain,
        source: "dashboard",
        messages: [...messages, userMessage].map((message) => ({
          sender: message.sender,
          text: message.text,
          timestamp: message.timestamp,
          domain: message.domain,
          category: message.category,
        })),
      };

      const response = await fetch(SUPPORT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await parseWebhookResponse(response);

      if (!response.ok) {
        const details =
          typeof data === "string"
            ? data
            : data?.message || data?.error || data?.hint || "";

        throw new Error(
          details
            ? `Request failed with status ${response.status}: ${details}`
            : `Request failed with status ${response.status}`,
        );
      }

      const replyText = getReplyText(data);
      const escalated = inferEscalation(data, replyText);

      const botMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: replyText,
        timestamp: createTimestamp(),
        category: normalizeValue(data.category || data.domain, "general"),
        sentiment: inferSentiment(data, replyText, escalated),
        escalated,
      };

      appendMessage(botMessage);
    } catch (error) {
      const errorMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong while contacting support AI. Please try again in a moment.",
        timestamp: createTimestamp(),
        category: "general",
        sentiment: "negative",
        escalated: true,
      };

      appendMessage(errorMessage);
      console.error("Chat request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const typingMessage = {
    id: "typing-indicator",
    sender: "bot",
    text: "",
    timestamp: createTimestamp(),
    isLoading: true,
  };

  return (
    <section className="chat-panel">
      <div className="chat-hero">
        <div className="hero-copy">
          <div className="hero-badge">Domain: E-Commerce</div>
          <h1>E-Commerce Support AI</h1>
          <p>
            Smart AI-powered customer support for orders, returns, payments, and
            account issues.
          </p>

          <div className="hero-highlights">
            <div className="highlight-chip">
              <Sparkles size={16} />
              Smart summaries
            </div>
            <div className="highlight-chip">
              <ShieldCheck size={16} />
              Escalation aware
            </div>
            <div className="highlight-chip">
              <MessageSquareText size={16} />
              Human-friendly chat
            </div>
          </div>
        </div>
      </div>

      <div className="chat-card">
        <div className="chat-header">
          <div>
            <p className="section-kicker">E-Commerce Assistant</p>
            <h2>Customer support conversation</h2>
          </div>

          <div className="status-pill">
            <span className={`status-dot ${isLoading ? "status-dot-busy" : ""}`} />
            {isLoading ? "Processing" : "Ready"}
          </div>
        </div>

        <div className="message-list">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && <MessageBubble message={typingMessage} />}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-sticky-bar">
          <InputBox
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onSubmit={handleSendMessage}
            disabled={isLoading}
            domain={domain}
            onDomainChange={(event) => setDomain(event.target.value)}
            domainOptions={domainOptions}
            selectedDomainOption={selectedDomainOption}
          />
        </div>
      </div>
    </section>
  );
}

export default Chat;
