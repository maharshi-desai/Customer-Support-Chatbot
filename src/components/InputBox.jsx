import { ChevronDown, SendHorizontal } from "lucide-react";

function InputBox({
  value,
  onChange,
  onSubmit,
  disabled,
  domain,
  onDomainChange,
  domainOptions,
  selectedDomainOption,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };
  const SelectedDomainIcon = selectedDomainOption.icon;

  return (
    <div className="input-shell">
      <div className="input-stack">
        <div className="domain-picker">
          <label className="domain-label" htmlFor="support-domain">
            Select E-Commerce Support Type
          </label>

          <div className="domain-select-wrap">
            <div className="domain-select-icon" aria-hidden="true">
              <SelectedDomainIcon size={16} />
            </div>

            <select
              id="support-domain"
              className="domain-select"
              value={domain}
              onChange={onDomainChange}
              disabled={disabled}
              aria-label="Select support category"
            >
              {domainOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown className="domain-chevron" size={16} aria-hidden="true" />
          </div>
        </div>

        <div className="composer-row">
          <label className="sr-only" htmlFor="support-message">
            Message input
          </label>

          <textarea
            id="support-message"
            className="chat-input"
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your order, refund, payment, or account..."
            rows={1}
            disabled={disabled}
          />

          <button
            type="button"
            className="send-button"
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputBox;
