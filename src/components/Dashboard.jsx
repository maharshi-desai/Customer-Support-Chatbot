import {
  AlertTriangle,
  BarChart3,
  MessageSquare,
  SmilePlus,
  Wrench,
} from "lucide-react";

function countBy(items, key, fallback) {
  return items.reduce((totals, item) => {
    const value =
      typeof item[key] === "string" && item[key].trim()
        ? item[key].trim().toLowerCase()
        : fallback;
    totals[value] = (totals[value] || 0) + 1;
    return totals;
  }, {});
}

function Dashboard({ messages }) {
  const botMessages = messages.filter((message) => message.sender === "bot");
  const escalatedCount = botMessages.filter((message) => message.escalated).length;
  const sentimentBreakdown = countBy(botMessages, "sentiment", "neutral");
  const categoryBreakdown = countBy(botMessages, "category", "general");

  const summaryCards = [
    {
      title: "Total Messages",
      value: messages.length,
      icon: MessageSquare,
      description: "Conversation turns captured across the chat session.",
    },
    {
      title: "Escalated Cases",
      value: escalatedCount,
      icon: AlertTriangle,
      description: "Messages flagged for extra attention or human intervention.",
    },
    {
      title: "Positive Sentiment",
      value: sentimentBreakdown.positive || 0,
      icon: SmilePlus,
      description: "Responses that reflect confident or favorable outcomes.",
    },
    {
      title: "Technical Cases",
      value: categoryBreakdown.technical || 0,
      icon: Wrench,
      description: "Support replies classified under technical assistance.",
    },
  ];

  const sentimentItems = [
    { label: "Positive", value: sentimentBreakdown.positive || 0, tone: "positive" },
    { label: "Neutral", value: sentimentBreakdown.neutral || 0, tone: "neutral" },
    { label: "Negative", value: sentimentBreakdown.negative || 0, tone: "negative" },
  ];

  const categoryItems = [
    { label: "Billing", value: categoryBreakdown.billing || 0 },
    { label: "Technical", value: categoryBreakdown.technical || 0 },
    { label: "General", value: categoryBreakdown.general || 0 },
  ];

  const maxSentiment = Math.max(...sentimentItems.map((item) => item.value), 1);
  const maxCategory = Math.max(...categoryItems.map((item) => item.value), 1);

  return (
    <section className="dashboard-panel">
      <div className="dashboard-header">
        <div>
          <p className="section-kicker">Analytics Overview</p>
          <h1>Conversation insights dashboard</h1>
          <p className="dashboard-copy">
            Track message volume, escalation trends, and support distribution as the
            assistant replies to customers.
          </p>
        </div>

        <div className="analytics-badge">
          <BarChart3 size={18} />
          Live metrics
        </div>
      </div>

      <div className="stats-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className="stat-card">
              <div className="stat-card-top">
                <div>
                  <p className="stat-label">{card.title}</p>
                  <h2>{card.value}</h2>
                </div>
                <div className="stat-icon">
                  <Icon size={20} />
                </div>
              </div>

              <p className="stat-description">{card.description}</p>
            </article>
          );
        })}
      </div>

      <div className="insight-grid">
        <article className="insight-card">
          <div className="insight-card-head">
            <h3>Sentiment breakdown</h3>
            <span>{botMessages.length} bot replies</span>
          </div>

          <div className="metric-list">
            {sentimentItems.map((item) => (
              <div key={item.label} className="metric-item">
                <div className="metric-meta">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="metric-bar">
                  <div
                    className={`metric-fill metric-fill-${item.tone}`}
                    style={{ width: `${(item.value / maxSentiment) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-card-head">
            <h3>Response categories</h3>
            <span>Support coverage</span>
          </div>

          <div className="metric-list">
            {categoryItems.map((item) => (
              <div key={item.label} className="metric-item">
                <div className="metric-meta">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-fill metric-fill-category"
                    style={{ width: `${(item.value / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
