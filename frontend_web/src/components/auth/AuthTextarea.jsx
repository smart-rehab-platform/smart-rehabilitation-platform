import { useId } from "react";
import { AlertCircle } from "lucide-react";
import { C, G } from "./tokens";

export function AuthTextarea({
  label,
  placeholder,
  value,
  onChange,
  state = "idle",
  message,
  onBlur,
  maxLength = 500,
  rows = 3,
  showCounter = false,
}) {
  const textareaId = useId();
  const hasValue = String(value ?? "").length > 0;

  const borderColor =
    state === "success"
      ? "rgba(79, 166, 248, 0.55)"
      : state === "error"
        ? "#ef4444"
        : "rgba(79, 166, 248, 0.18)";

  const focusShadow =
    state === "error"
      ? "0 0 0 3px rgba(239, 68, 68, 0.14), inset 0 1px 2px rgba(0, 0, 0, 0.16)"
      : "0 0 0 3px rgba(79, 166, 248, 0.16), inset 0 1px 2px rgba(0, 0, 0, 0.16)";

  return (
    <div className="flex flex-col gap-2">
      <div className="auth-input-shell group relative">
        <textarea
          id={textareaId}
          placeholder=" "
          rows={rows}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="auth-textarea peer w-full resize-none rounded-2xl px-4 pb-2 pt-6 text-sm leading-5 outline-none transition-all duration-200"
          style={{
            background: G.inputGlass,
            border: `1px solid ${borderColor}`,
            color: C.white,
            fontFamily: "'Inter', sans-serif",
            boxShadow: G.inputInnerShadow,
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = focusShadow;
            e.currentTarget.style.borderColor =
              state === "idle" ? "rgba(79, 166, 248, 0.55)" : borderColor;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = G.inputInnerShadow;
            e.currentTarget.style.borderColor = borderColor;
            onBlur?.();
          }}
        />

        <label
          htmlFor={textareaId}
          className={`auth-input-label auth-textarea-label pointer-events-none absolute left-4 z-10 origin-left transition-all duration-200 ${
            hasValue ? "auth-input-label-floating" : ""
          }`}
          style={{ color: C.textLight }}
        >
          {label}
        </label>

        {state === "error" && (
          <AlertCircle
            size={16}
            className="absolute right-3.5 top-4 z-10"
            color="#ef4444"
          />
        )}
      </div>

      <div className="flex items-start justify-between gap-3 pl-1">
        {message ? (
          <p className="text-xs" style={{ color: state === "error" ? "#ef4444" : G.success }}>
            {message}
          </p>
        ) : (
          <span />
        )}
        {showCounter && (
          <p className="text-[11px] font-medium" style={{ color: "#5A7390" }}>
            {String(value ?? "").length} / {maxLength}
          </p>
        )}
      </div>

      <span className="sr-only">{placeholder}</span>
    </div>
  );
}
