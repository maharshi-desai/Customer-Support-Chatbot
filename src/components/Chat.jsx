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

const domainOptions = [
  { value: "orders", label: "📦 Orders", icon: Package },
  { value: "returns-refunds", label: "🔁 Returns & Refunds", icon: RotateCcw },
  { value: "payments", label: "💳 Payments", icon: CreditCard },
  { value: "account", label: "👤 Account", icon: CircleUserRound },
  { value: "general", label: "💬 General", icon: LayoutGrid },
];

function Chat({ messages, setMessages, createTimestamp }) {
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

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/webhook/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          domain,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: data.reply || "I'm here to help, but I didn't receive a response.",
        timestamp: createTimestamp(),
        category: normalizeValue(data.category, "general"),
        sentiment: normalizeValue(data.sentiment, "neutral"),
        escalated: Boolean(data.escalated),
      };

      setMessages((previousMessages) => [...previousMessages, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: "Something went wrong while contacting support AI. Please try again in a moment.",
        timestamp: createTimestamp(),
        category: "general",
        sentiment: "negative",
        escalated: true,
      };

      setMessages((previousMessages) => [...previousMessages, errorMessage]);
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
