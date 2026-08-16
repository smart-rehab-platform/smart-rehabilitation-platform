import { useCallback, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";

export function AiComposer({
  value,
  onChange,
  onSend,
  isSending,
  disabled = false,
}) {
  const { t } = useLocale();
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
        {t("parent.aiAssistant.messageInputLabel")}
      </label>
      <textarea
        ref={textareaRef}
        id="pd-ai-composer-input"
        className="pd-ai-composer-input"
        rows={3}
        value={value}
        placeholder={t("parent.aiAssistant.inputPlaceholder")}
        disabled={disabled || isSending}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-describedby="pd-ai-composer-hint"
      />
      <div className="pd-ai-composer-actions">
        <span id="pd-ai-composer-hint" className="pd-ai-composer-hint">
          {t("parent.aiAssistant.composerHint")}
        </span>
        <button
          type="button"
          className="pd-btn pd-btn-primary pd-ai-composer-send"
          aria-label={t("parent.aiAssistant.sendMessageAria")}
          disabled={disabled || isSending || !value.trim()}
          onClick={handleSend}
        >
          <Send size={16} aria-hidden="true" />
          {isSending ? t("parent.aiAssistant.sending") : t("parent.messages.send")}
        </button>
      </div>
    </div>
  );
}
