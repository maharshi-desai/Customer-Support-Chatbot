import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";

const createTimestamp = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const OLD_WELCOME_MESSAGE =
  "Welcome to the Agentic Customer Support System. Ask about billing, technical issues, or general support and I'll help you right away.";

const NEW_WELCOME_MESSAGE = `Welcome to E-Commerce Support AI 🛒

I can help you with:
• Order tracking 📦
• Returns & refunds 🔁
• Payments 💳
• Account issues 👤

How can I assist you today?`;

const initialMessages = [
  {
    id: crypto.randomUUID(),
    sender: "bot",
    text: NEW_WELCOME_MESSAGE,
    timestamp: createTimestamp(),
    category: "general",
    sentiment: "positive",
    escalated: false,
  },
];

const LEGACY_STORAGE_KEY = "agentic-customer-support-messages";
const SESSION_STORAGE_KEY = "agentic-customer-support-session-messages";
const ANALYTICS_STORAGE_KEY = "agentic-customer-support-analytics-messages";

const inferEscalation = (message) => {
  if (typeof message?.escalated === "boolean") {
    return message.escalated;
  }

  const text = typeof message?.text === "string" ? message.text.toLowerCase() : "";

  return (
    text.includes("escalated to a human") ||
    text.includes("escalated to human") ||
    text.includes("human agent") ||
    text.includes("transferred to an agent")
  );
};

const inferSentiment = (message, escalated) => {
  if (typeof message?.sentiment === "string" && message.sentiment.trim()) {
    const normalizedSentiment = message.sentiment.trim().toLowerCase();

    if (escalated && normalizedSentiment === "neutral") {
      return "negative";
    }

    return normalizedSentiment;
  }

  const text = typeof message?.text === "string" ? message.text.toLowerCase() : "";

  if (
    escalated ||
    text.includes("failed") ||
    text.includes("frustrated") ||
    text.includes("issue") ||
    text.includes("problem")
  ) {
    return "negative";
  }

  return "neutral";
};

const normalizeMessage = (message, index = -1) => {
  const escalated = inferEscalation(message);

  const normalizedMessage = {
    ...message,
    escalated,
    sentiment: inferSentiment(message, escalated),
  };

  if (
    index === 0 &&
    message?.sender === "bot" &&
    message?.text === OLD_WELCOME_MESSAGE
  ) {
    return {
      ...normalizedMessage,
      text: NEW_WELCOME_MESSAGE,
    };
  }

  return normalizedMessage;
};

const isTrackableMessage = (message) =>
  !(
    message?.sender === "bot" &&
    typeof message?.text === "string" &&
    message.text.trim() === NEW_WELCOME_MESSAGE.trim()
  );

function readStoredMessages(storage, key) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedMessages = storage.getItem(key);

    if (!storedMessages) {
      return [];
    }

    const parsedMessages = JSON.parse(storedMessages);

    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return [];
    }

    return parsedMessages.map((message, index) => normalizeMessage(message, index));
  } catch (error) {
    console.error("Failed to read saved messages:", error);
    return [];
  }
}

function getSessionMessages() {
  if (typeof window === "undefined") {
    return initialMessages;
  }

  const sessionMessages = readStoredMessages(window.sessionStorage, SESSION_STORAGE_KEY);
  return sessionMessages.length > 0 ? sessionMessages : initialMessages;
}

function getAnalyticsMessages() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedAnalytics = readStoredMessages(window.localStorage, ANALYTICS_STORAGE_KEY);

  if (storedAnalytics.length > 0) {
    return storedAnalytics.filter(isTrackableMessage);
  }

  const legacyMessages = readStoredMessages(window.localStorage, LEGACY_STORAGE_KEY);
  return legacyMessages.filter(isTrackableMessage);
}

function App() {
  const [messages, setMessages] = useState(getSessionMessages);
  const [analyticsMessages, setAnalyticsMessages] = useState(getAnalyticsMessages);

  const appendMessage = (message, options = {}) => {
    const { trackAnalytics = true } = options;
    const normalizedMessage = normalizeMessage(message);

    setMessages((previousMessages) => [...previousMessages, normalizedMessage]);

    if (trackAnalytics && isTrackableMessage(normalizedMessage)) {
      setAnalyticsMessages((previousMessages) => [...previousMessages, normalizedMessage]);
    }
  };

  useEffect(() => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    window.localStorage.setItem(
      ANALYTICS_STORAGE_KEY,
      JSON.stringify(analyticsMessages),
    );
  }, [analyticsMessages]);

  useEffect(() => {
    if (window.localStorage.getItem(LEGACY_STORAGE_KEY)) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, []);

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-one" />
      <div className="background-orb background-orb-two" />

      <div className="page-frame">
        <Navbar />

        <main className="page-content">
          <Routes>
            <Route
              path="/"
              element={
                <Chat
                  messages={messages}
                  appendMessage={appendMessage}
                  createTimestamp={createTimestamp}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard messages={analyticsMessages} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
