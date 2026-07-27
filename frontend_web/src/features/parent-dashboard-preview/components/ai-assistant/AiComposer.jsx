import { useCallback, useEffect, useRef } from "react";
import { Send } from "lucide-react";

export function AiComposer({
  value,
  onChange,
  onSend,
  isSending,
  disabled = false,
  placeholder = "Ask about exercises, progress, or home practice...",
}) {
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    if (disabled || isSending) {
      return;
    }
    onSend?.(value);
  }, [disabled, isSending, onSend, value]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  useEffect(() => {
    if (!isSending && !disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSending, disabled]);

  return (
    <div className="pd-ai-composer">
      <label className="pd-visually-hidden" htmlFor="pd-ai-composer-input">
        Message to AI Assistant
      </label>
      <textarea
        ref={textareaRef}
        id="pd-ai-composer-input"
        className="pd-ai-composer-input"
        rows={3}
        value={value}
        placeholder={placeholder}
        disabled={disabled || isSending}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-describedby="pd-ai-composer-hint"
      />
      <div className="pd-ai-composer-actions">
        <span id="pd-ai-composer-hint" className="pd-ai-composer-hint">
          Enter to send, Shift+Enter for a new line
        </span>
        <button
          type="button"
          className="pd-btn pd-btn-primary pd-ai-composer-send"
          aria-label="Send message"
          disabled={disabled || isSending || !value.trim()}
          onClick={handleSend}
        >
          <Send size={16} aria-hidden="true" />
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
