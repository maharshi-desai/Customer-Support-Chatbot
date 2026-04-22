import { AlertTriangle, Bot, User } from "lucide-react";

function formatLabel(value) {
  if (!value) {
    return "General";
  }

  return value
    .toString()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getDomainVisual(domain) {
  switch (domain) {
    case "orders":
      return { label: "Orders" };
    case "returns-refunds":
      return { label: "Returns & Refunds" };
    case "payments":
      return { label: "Payments" };
    case "account":
      return { label: "Account" };
    default:
      return { label: "General" };
  }
}

function MessageBubble({ message }) {
  const isUser = message.sender === "user";
  const isLoading = message.isLoading;
  const domainVisual = getDomainVisual(message.domain);

  return (
    <article
      className={`message-row ${isUser ? "message-row-user" : "message-row-bot"} ${
        isLoading ? "message-row-loading" : ""
      }`}
    >
      {!isUser && (
        <div className="message-avatar message-avatar-bot" aria-hidden="true">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`message-bubble ${
          isUser ? "message-bubble-user" : "message-bubble-bot"
        }`}
      >
        <div className="message-text">
          {isLoading ? (
            <div className="typing-indicator" aria-live="polite" aria-label="AI is typing">
              <span>AI is typing</span>
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : (
            message.text
          )}
        </div>

        <div className="message-footer">
          <span className="message-timestamp">{message.timestamp}</span>

          {isUser && message.domain && (
            <div className="message-metadata message-metadata-user">
              <span className="domain-tag">[{domainVisual.label}]</span>
            </div>
          )}

          {!isUser && !isLoading && (
            <div className="message-metadata">
              <span>Category: {formatLabel(message.category)}</span>
              <span>Sentiment: {formatLabel(message.sentiment)}</span>
              <span
                className={
                  message.escalated ? "metadata-escalated metadata-alert" : "metadata-escalated"
                }
              >
                {message.escalated && <AlertTriangle size={13} />}
                Escalated: {message.escalated ? "Yes" : "No"}
              </span>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="message-avatar message-avatar-user" aria-hidden="true">
          <User size={18} />
        </div>
      )}
    </article>
  );
}

export default MessageBubble;
