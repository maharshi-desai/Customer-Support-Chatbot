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

const STORAGE_KEY = "agentic-customer-support-messages";

function getStoredMessages() {
  if (typeof window === "undefined") {
    return initialMessages;
  }

  try {
    const storedMessages = window.localStorage.getItem(STORAGE_KEY);

    if (!storedMessages) {
      return initialMessages;
    }

    const parsedMessages = JSON.parse(storedMessages);

    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return initialMessages;
    }

    return parsedMessages.map((message, index) => {
      if (index === 0 && message?.sender === "bot" && message?.text === OLD_WELCOME_MESSAGE) {
        return {
          ...message,
          text: NEW_WELCOME_MESSAGE,
        };
      }

      return message;
    });
  } catch (error) {
    console.error("Failed to read saved messages:", error);
    return initialMessages;
  }
}

function App() {
  // Store conversation history once so both screens stay in sync.
  const [messages, setMessages] = useState(getStoredMessages);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

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
                  setMessages={setMessages}
                  createTimestamp={createTimestamp}
                />
              }
            />
            <Route path="/dashboard" element={<Dashboard messages={messages} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
